import { IEventEmitter } from './common';

/**
 * An interface for an abstract component
 * that displays a list of offers and allows
 * for selecting an offer
 */
export interface IOfferListComponent {
    events: IEventEmitter<IOfferListComponentEvents>;
    destroy: () => void;
}

export interface IOfferListComponentOptions {}

export interface IOfferListComponentEvents {
    offerSelect: IOfferSelectedEvent;
}

export interface IOfferSelectedEvent {
    offerId: string;
}
