import {
    IFormattedDistance,
    IFormattedDuration,
    IFormattedPrice,
    ILocation
} from './common';

/**
 * An interface for a low-level API “wrapper”.
 * Allows for:
 *   * Searching offers by a query
 *   * Creating an order by an offer
 */
export interface ICoffeeApi {
    search: (query: string) => Promise<ISearchResult[]>;
    createOrder: (parameters: { offerId: string }) => Promise<INewOrder>;
}

/**
 * A specific search result represeting
 * detailed information about an offer
 */
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

/**
 * A dummy interface for a newly created order
 */
export interface INewOrder {
    orderId: string;
}
