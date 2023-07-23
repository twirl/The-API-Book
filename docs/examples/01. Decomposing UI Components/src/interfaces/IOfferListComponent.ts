import { IEventEmitter } from './common';

export interface IOfferListComponent {
    events: IEventEmitter<IOfferListEvents>;
    destroy: () => void;
}

export interface IOfferListComponentOptions {}

export interface IOfferListEvents {
    offerSelect: IOfferSelectedEvent;
}

export interface IOfferSelectedEvent {
    offerId: string;
}
