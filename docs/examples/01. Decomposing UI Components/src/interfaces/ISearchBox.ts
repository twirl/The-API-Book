import { INewOrder, ISearchResult } from './ICoffeeApi';
import { IEventEmitter } from './common';

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
