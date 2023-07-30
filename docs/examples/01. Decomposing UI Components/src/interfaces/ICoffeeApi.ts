import {
    IFormattedDistance,
    IFormattedDuration,
    IFormattedPrice,
    ILocation
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
        location: ILocation;
        icon?: string;
        phone?: string;
    };
    price: IFormattedPrice;
}

export interface INewOrder {
    orderId: string;
}
