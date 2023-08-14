import { INewOrder, ISearchResult } from './ICoffeeApi';
import { IEventEmitter } from './common';

/**
 * An interface for an abstract component
 * that allows the user or the developer to enter
 * a search phrase and interact with the search results,
 * including creating an order
 */
export interface ISearchBox {
    events: IEventEmitter<ISearchBoxEvents>;
    search: (query: string) => void;
    getOfferList: () => ISearchResult[] | null;
    createOrder: (parameters: { offerId: string }) => Promise<INewOrder>;
    destroy: () => void;
}

export interface ISearchBoxOptions {}

export interface ISearchBoxEvents {
    offerListChange: ISearchBoxOfferListChangeEvent;
}

export interface ISearchBoxOfferListChangeEvent {
    offerList: ISearchResult[] | null;
}
