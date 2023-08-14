/**
 * @fileoverview
 * This file comprises a reference implementation
 * of the `ISearchBox` interface called simply `SearchBox`
 */

import { IDisposer, IEventEmitter } from './interfaces/common';
import { ICoffeeApi, INewOrder, ISearchResult } from './interfaces/ICoffeeApi';
import {
    ISearchBox,
    ISearchBoxEvents,
    ISearchBoxOptions
} from './interfaces/ISearchBox';
import { ISearchBoxComposer } from './interfaces/ISearchBoxComposer';
import { EventEmitter } from './util/EventEmitter';
import { SearchBoxComposer } from './SearchBoxComposer';
import { OfferPanelComponentOptions } from './OfferPanelComponent';
import { $, html } from './util/html';

/**
 * A `SearchBox` represents a UI component
 * that allows an end user to enter search queries,
 * work with the received results and place orders.
 * The user input which will be propagated
 * to the underlying `ourCoffeeApi` functionality.
 *
 * The responsibility of this class is:
 *   * Handling user input consistently
 *   * Instantiating the `ISearchBoxComposer` subcomponent
 *     that takes care of the offer list UI & UX, and creating
 *     orders if a `composers` requests to.
 *   * Emitting events when current displayed search results
 *     (offers) are changed
 *   * Providing methods to programmatically initialize
 *     searching a given query and make orders
 */
export class SearchBox implements ISearchBox {
    /**
     * An accessor to subscribe for events or emit them.
     */
    public readonly events: IEventEmitter<ISearchBoxEvents> =
        new EventEmitter();
    /**
     * The resolved options
     */
    protected readonly options: SearchBoxOptions;
    /**
     * The instance of the search box composer
     * that will handle presenting offers to the user
     */
    protected readonly composer: ISearchBoxComposer;
    /**
     * The current list of search results (offers) to
     * present to the user. Might be `null`.
     */
    protected offerList: ISearchResult[] | null = null;
    /**
     * The UI elements that are controlled by the `SearchBox` itself.
     */
    protected searchButton: HTMLButtonElement;
    protected input: HTMLInputElement;
    protected layoutContainer: HTMLInputElement;

    /**
     * A current asynchronous request to the search API (if any).
     * Needed to manage a possible race if the user or
     * the developer fires several search queries in a row.
     */
    private currentRequest: Promise<ISearchResult[]> | null = null;
    /**
     * Event listeners to get disposed upon desructing the `SearchBox`
     */
    private listenerDisposers: IDisposer[] = [];

    /**
     * A `SearchBox` synchoronously initializes itself
     * in the given HTML element context and will use
     * the given instance of the `ICoffeeApi` interface
     * to run search queries and create orders.
     */
    constructor(
        protected readonly container: HTMLElement,
        protected readonly coffeeApi: ICoffeeApi,
        options?: Partial<SearchBoxOptions>
    ) {
        this.options =
            options !== undefined
                ? {
                      ...SearchBox.DEFAULT_OPTIONS,
                      ...options
                  }
                : { ...SearchBox.DEFAULT_OPTIONS };
        this.render();
        this.composer = this.buildComposer(
            this,
            this.layoutContainer,
            this.options
        );
        this.setupListeners();
    }

    /* These three methods are provided for consistency
       for the developer to have access to the full state
       of the `SearchBox` entity */
    public getOptions() {
        return this.options;
    }

    public getContainer() {
        return this.container;
    }

    public getOfferList() {
        return this.offerList;
    }

    /**
     * Performs searching of offers and reflects this
     * operation in the UI
     * @param {string} rawQuery Raw unsanitized input
     */
    public async search(rawQuery: string): Promise<void> {
        // Shall empty queries be allowed?
        // As it's an API method, it might make sense
        // for a developer to send empty strings to
        // the API method, so we keep this possibility
        const query = rawQuery.trim();
        this.input.value = query;
        const request = (this.currentRequest = this.coffeeApi.search(query));
        this.setOfferList(null);
        await request.then((result: ISearchResult[]) => {
            if (request === this.currentRequest) {
                this.setOfferList(result);
                this.currentRequest = null;
            }
        });
    }

    /**
     * Creates an order based on the offer.
     */
    public createOrder(parameters: { offerId: string }): Promise<INewOrder> {
        return this.coffeeApi.createOrder(parameters);
    }

    /**
     * Destroys the `SearchBox` and all its subcomponents
     */
    public destroy() {
        this.teardownListeners();
        this.composer.destroy();
        this.container.innerHTML = '';
        this.currentRequest = this.offerList = null;
    }

    /**
     * Default options of the `SearchBox` component
     */
    public static DEFAULT_OPTIONS: SearchBoxOptions = {
        searchButtonText: 'Search'
    };

    /**
     * Factory method to create a composer.
     * Exposed as a protected method to allow
     * instantiating custom composers.
     * @param {ISearchBox} context Parent search box
     * @param {HTMLElement} container An HTML Element
     * container prepared for rendering the UI
     * @param {ISearchBoxOptions} options Parent options
     * @returns
     */
    protected buildComposer(
        context: ISearchBox,
        container: HTMLElement,
        options: ISearchBoxOptions
    ): ISearchBoxComposer {
        return new SearchBoxComposer(context, container, options);
    }

    /**
     * The internal implementation of setting a new
     * offer list after a search is performed.
     * Provided as a protected method to allow for custom
     * search result list modifications in a subclass.
     */
    protected setOfferList(offerList: ISearchResult[] | null) {
        if (this.offerList !== offerList) {
            this.offerList = offerList;
            this.events.emit('offerListChange', { offerList });
        }
    }
    /**
     * Handling a 'Search' button press event. Provided as
     * a protected method to allow custom validations
     * or alternative inputs
     */
    protected onSearchButtonClickListener = () => {
        const query = this.input.value.trim();
        if (query) {
            this.search(query);
        }
    };

    /**
     * Rendering HTML markup of the composer
     */
    private render() {
        this.container.innerHTML = html`<div class="our-coffee-sdk-search-box">
            <div class="our-coffee-sdk-search-box-head">
                <input type="text" class="our-coffee-sdk-search-box-input" />
                <button class="our-coffee-sdk-search-box-search-button">
                    ${this.options.searchButtonText}
                </button>
            </div>
            <div class="our-coffee-sdk-layout-container"></div>
        </div>`.toString();
        this.input = $(this.container, '.our-coffee-sdk-search-box-input');
        this.searchButton = $(
            this.container,
            '.our-coffee-sdk-search-box-search-button'
        );
        this.layoutContainer = $(
            this.container,
            '.our-coffee-sdk-layout-container'
        );
    }

    /**
     * Working with various events
     */
    private setupListeners() {
        this.searchButton.addEventListener(
            'click',
            this.onSearchButtonClickListener,
            false
        );
        this.listenerDisposers.push(
            this.composer.events.on('createOrder', ({ offer: { offerId } }) =>
                this.createOrder({ offerId })
            )
        );
    }

    private teardownListeners() {
        for (const disposer of this.listenerDisposers) {
            disposer.off();
        }
        this.listenerDisposers = [];
        this.searchButton.removeEventListener(
            'click',
            this.onSearchButtonClickListener,
            false
        );
    }
}

export interface SearchBoxOptions extends ISearchBoxOptions {
    searchButtonText: string;
    offerPanel?: Partial<OfferPanelComponentOptions>;
}
