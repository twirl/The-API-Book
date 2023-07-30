import { SearchBoxComposer } from './SearchBoxComposer';

import { $, html } from './util/html';
import { ICoffeeApi, INewOrder, ISearchResult } from './interfaces/ICoffeeApi';
import {
    ISearchBox,
    ISearchBoxEvents,
    ISearchBoxOptions
} from './interfaces/ISearchBox';
import { ISearchBoxComposer } from './interfaces/ISearchBoxComposer';
import { IDisposer, IEventEmitter } from './interfaces/common';
import { EventEmitter } from './util/EventEmitter';
import { OfferPanelComponentOptions } from './OfferPanelComponent';

export class SearchBox implements ISearchBox {
    public readonly events: IEventEmitter<ISearchBoxEvents> =
        new EventEmitter();

    protected readonly options: SearchBoxOptions;
    protected readonly composer: ISearchBoxComposer;
    protected offerList: ISearchResult[] | null = null;
    protected currentRequest: Promise<ISearchResult[]> | null = null;
    protected searchButton: HTMLButtonElement;
    protected input: HTMLInputElement;
    protected layoutContainer: HTMLInputElement;
    protected listenerDisposers: IDisposer[] = [];

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

    public getOptions() {
        return this.options;
    }

    public getContainer() {
        return this.container;
    }

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

    public getOfferList() {
        return this.offerList;
    }

    public createOrder(parameters: { offerId: string }): Promise<INewOrder> {
        return this.coffeeApi.createOrder(parameters);
    }

    public destroy() {
        this.teardownListeners();
        this.composer.destroy();
        this.container.innerHTML = '';
        this.currentRequest = this.offerList = null;
    }

    public buildComposer(
        context: SearchBox,
        container: HTMLElement,
        options: SearchBoxOptions
    ): ISearchBoxComposer {
        return new SearchBoxComposer(context, container, options);
    }

    public static DEFAULT_OPTIONS: SearchBoxOptions = {
        searchButtonText: 'Search'
    };

    protected render() {
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

    protected onSearchButtonClickListener = () => {
        const query = this.input.value.trim();
        if (query) {
            this.search(query);
        }
    };
    protected setupListeners() {
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
    protected teardownListeners() {
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

    protected setOfferList(offerList: ISearchResult[] | null) {
        if (this.offerList !== offerList) {
            this.offerList = offerList;
            this.events.emit('offerListChange', { offerList });
        }
    }
}

export interface SearchBoxOptions extends ISearchBoxOptions {
    searchButtonText: string;
    offerPanel?: Partial<OfferPanelComponentOptions>;
}

export type SearchBoxComposerBuilder = (
    context: SearchBox
) => ISearchBoxComposer;
