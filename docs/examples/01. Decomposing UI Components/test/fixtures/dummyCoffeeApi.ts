import { ICoffeeApi, INewOrder } from '../../src/interfaces/ICoffeeApi';
import {
    IOfferFullView,
    IOfferPreview
} from '../../src/interfaces/ISearchBoxComposer';

export const CAFEE_CHAMOMILE_LUNGO_OFFER = {
    offerId: '1',
    recipe: {
        title: 'Lungo',
        shortDescription: 'Best Lungo in the town!',
        mediumDescription: `It's our best lungo. Smart SDK developers always choose Cafe “Chamomile” Lungo!`
    },
    place: {
        title: 'Cafe “Chamomile”',
        walkingDistance: {
            numericValueMeters: 200,
            formattedValue: '200m'
        },
        location: {
            longitude: 16.361645,
            latitude: 48.211515
        },
        walkTime: {
            intervalValueSeconds: 120,
            formattedValue: '2 min'
        },
        icon: '../../assets/coffee.png'
    },
    price: {
        decimalValue: '37.00',
        formattedValue: '$37',
        currencyCode: 'USD'
    }
};

export const CAFEE_CHAMOMILE_LUNGO_OFFER_PREVIEW: IOfferPreview = {
    offerId: '1',
    title: 'Cafe “Chamomile”',
    subtitle: 'Best Lungo in the town!',
    bottomLine: '200m · 2 min',
    imageUrl: '/assets/coffee.png',
    price: {
        decimalValue: '37.00',
        formattedValue: '$37',
        currencyCode: 'USD'
    }
};

export const CAFEE_CHAMOMILE_LUNGO_OFFER_FULL_VIEW: IOfferFullView = {
    offerId: '1',
    title: 'Cafe “Chamomile”',
    description: [
        'This is our best lungo. Smart SDK developers always choose Cafe “Chamomile” Lungo!',
        '200m · 2 min'
    ],
    price: {
        decimalValue: '37.00',
        formattedValue: '$37',
        currencyCode: 'USD'
    }
};

export const DUMMY_RESPONSE = [
    CAFEE_CHAMOMILE_LUNGO_OFFER,
    {
        offerId: '2',
        recipe: {
            title: 'Lungo',
            shortDescription: 'Best Lungo in the world!',
            mediumDescription: `It's our best lungo. Smart SDK developers always choose Peripheral Perk© Lungo!`
        },
        place: {
            title: 'Peripheral Perk',
            walkingDistance: {
                numericValueMeters: 400,
                formattedValue: '400m'
            },
            location: {
                longitude: 16.365423,
                latitude: 48.210377
            },
            walkTime: {
                intervalValueSeconds: 600,
                formattedValue: '5 min'
            }
        },
        price: {
            decimalValue: '39.00',
            formattedValue: '$39',
            currencyCode: 'USD'
        }
    },
    {
        offerId: '3',
        recipe: {
            title: 'Lungo',
            shortDescription: 'Best Lungo in this app!',
            mediumDescription: `It's our best lungo. Smart SDK developers always choose Top Top Cafe Lungo!`
        },
        place: {
            title: 'Top Top Cafe',
            walkingDistance: {
                numericValueMeters: 50,
                formattedValue: '50m'
            },
            location: {
                longitude: 16.367205,
                latitude: 48.208574
            },
            walkTime: {
                intervalValueSeconds: 50,
                formattedValue: 'less than a minute'
            }
        },
        price: {
            decimalValue: '41.00',
            formattedValue: '$41',
            currencyCode: 'USD'
        }
    }
];
export const DUMMY_PREVIEWS = [CAFEE_CHAMOMILE_LUNGO_OFFER_PREVIEW];

export const DUMMY_ORDER = {
    orderId: '321'
};

export const dummyCoffeeApi: ICoffeeApi = {
    search: async () => [...DUMMY_RESPONSE],
    createOrder: async (): Promise<INewOrder> => DUMMY_ORDER
};
