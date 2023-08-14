import { ISearchResult } from './ICoffeeApi';
import { IEventEmitter, IFormattedPrice } from './common';

/**
 * An interface for an abstract “composer” to serve
 * as a bridge between a `SearchBox` and its customizable
 * representation.
 *
 * A `composer` is stateful, implying that it somehow stores
 * the offers being displayed.
 */
export interface ISearchBoxComposer {
    events: IEventEmitter<ISearchBoxComposerEvents>;
    /**
     * An accessor to the internal state that allows for
     * querying it but not exposes the details regarding
     * how the data is stored.
     */
    findOfferById: (offerId: string) => ISearchResult | null;
    destroy: () => void;
}

export interface ISearchBoxComposerEvents {
    offerPreviewListChange: IOfferPreviewListChangeEvent;
    offerFullViewToggle: IOfferFullViewToggleEvent;
    createOrder: ICreateOrderEvent;
}

export interface IOfferPreviewListChangeEvent {
    offerList: IOfferPreview[] | null;
}

export interface IOfferFullViewToggleEvent {
    offer: IOfferFullView | null;
}

export interface ICreateOrderEvent {
    offer: ISearchResult;
}

export interface IOfferPreview {
    offerId: string;
    title: string;
    subtitle: string;
    bottomLine: string;
    imageUrl?: string;
    price: IFormattedPrice;
}

export interface IOfferFullView {
    offerId: string;
    title: string;
    description: string[];
    price: IFormattedPrice;
}
