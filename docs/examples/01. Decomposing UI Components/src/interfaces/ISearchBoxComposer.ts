import { ISearchResult } from './ICoffeeApi';
import { IEventEmitter, IFormattedPrice } from './common';

export interface ISearchBoxComposer {
    events: IEventEmitter<ISearchBoxComposerEvents>;
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
