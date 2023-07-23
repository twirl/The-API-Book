import { IEventEmitter } from './common';

export interface IOfferPanelComponent {
    events: IEventEmitter<IOfferPanelComponentEvents>;
    destroy: () => void;
}

export interface IOfferPanelComponentOptions {
    createOrderButtonUrl?: string;
    createOrderButtonText?: string;
    closeButtonUrl?: string;
    closeButtonText?: string;
}

export interface IOfferPanelComponentEvents {
    action: IOfferPanelActionEvent;
}

export interface IOfferPanelActionEvent {
    action: string;
    offerId: string;
}
