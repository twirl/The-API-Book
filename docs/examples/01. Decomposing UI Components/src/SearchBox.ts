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

export class SearchBox implements ISearchBox {
    public readonly events: IEventEmitter<ISearchBoxEvents> =
        new EventEmitter();

    protected readonly options: SearchBoxOptions;
    protected readonly composer: ISearchBoxComposer;
    protected offerList: ISearchResult[] | null = null;
    protected currentRequest: Promise<ISearchResult[]> | null = null;
    protected searchButton: HTMLButtonElement;
    protected listenerDisposers: IDisposer[] = [];

    public constructor(
        protected readonly parentNode: HTMLElement,
        protected readonly coffeeApi: ICoffeeApi,
        options: ISearchBoxOptions
    ) {
        this.options = {
            ...SearchBox.DEFAULT_OPTIONS,
            ...options
        };
        this.render();
        this.composer = this.buildComposer();
        this.setupListeners();
    }

    public getOptions() {
        return this.options;
    }

    public getContainer() {
        return this.parentNode;
    }

    public search(query: string): void {
        const request = (this.currentRequest = this.coffeeApi.search(query));
        this.setOfferList(null);
        request.then((result: ISearchResult[]) => {
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
        this.composer.destroy();
        this.currentRequest = this.offerList = null;
    }

    public buildComposer() {
        return new SearchBoxComposer(this, this.parentNode, this.options);
    }

    public static DEFAULT_OPTIONS: SearchBoxOptions = {
        searchButtonText: 'Search'
    };

    protected render() {
        this.parentNode.innerHTML = html`<div class="our-coffee-sdk-search-box">
            <div class="our-coffee-sdk-search-box-head">
                <input type="text" class="our-coffee-sdk-search-box-input" />
                <button class="our-coffee-sdk-search-box-search-button">
                    ${this.options.searchButtonText}
                </button>
            </div>
        </div>`.toString();
        this.searchButton = $(
            this.parentNode,
            '.our-coffee-sdk-search-box-search-button'
        );
    }

    protected onSearchButtonClickListener = () => {
        this.search(this.searchButton.value);
    };
    protected setupListeners() {
        this.searchButton.addEventListener(
            'click',
            this.onSearchButtonClickListener,
            false
        );
        this.listenerDisposers.push(
            this.composer.events.on('createOrder', ({ offer: offerId }) =>
                this.createOrder(offerId)
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
        this.offerList = offerList;
        this.events.emit('offerListChange', { offerList });
    }
}

export interface SearchBoxOptions extends ISearchBoxOptions {
    searchButtonText: string;
}

export type SearchBoxComposerBuilder = (
    context: SearchBox
) => ISearchBoxComposer;
