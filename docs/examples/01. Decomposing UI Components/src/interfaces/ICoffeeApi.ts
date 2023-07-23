import {
    IFormattedDistance,
    IFormattedDuration,
    IFormattedPrice
} from './common';

export interface ICoffeeApi {
    search: (query: string) => Promise<ISearchResult[]>;
    createOrder: (parameters: { offerId: string }) => Promise<INewOrder>;
}

export interface ISearchResult {
    offerId: string;
    recipe: {
        title: string;
        shortDescription: string;
        mediumDescription: string;
    };
    place: {
        title: string;
        walkingDistance: IFormattedDistance;
        walkTime: IFormattedDuration;
    };
    price: IFormattedPrice;
}

export interface INewOrder {
    orderId: string;
}
