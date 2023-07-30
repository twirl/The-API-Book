import { IOfferListComponent } from '../../src/interfaces/IOfferListComponent';
import { IOfferPanelComponent } from '../../src/interfaces/IOfferPanelComponent';
import { ISearchBox } from '../../src/interfaces/ISearchBox';
import { ISearchBoxComposer } from '../../src/interfaces/ISearchBoxComposer';
import { EventEmitter } from '../../src/util/EventEmitter';

export const mockSearchBox: ISearchBox = {
    events: new EventEmitter(),
    search: async () => {
        throw new Error();
    },
    getOfferList: jest.fn(),
    destroy: () => {},
    createOrder: async () => {
        throw new Error();
    }
};

export const mockComposer: ISearchBoxComposer = {
    events: new EventEmitter(),
    findOfferById: jest.fn(),
    destroy: jest.fn()
};

export const mockOfferList: IOfferListComponent = {
    events: new EventEmitter(),
    destroy: jest.fn()
};

export const mockOfferPanel: IOfferPanelComponent = {
    events: new EventEmitter(),
    destroy: jest.fn()
};
