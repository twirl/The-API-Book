import { IEventEmitter } from './common';

/**
 * An interface for an abstract component
 * that displays a detailed data about an
 * offer and allows the user to interact
 * with it by emitting action events
 */
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
    currentOfferId: string;
    target?: any;
}
