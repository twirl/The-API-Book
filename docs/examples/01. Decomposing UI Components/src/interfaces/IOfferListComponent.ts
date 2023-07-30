import { IEventEmitter } from './common';

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
