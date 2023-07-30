/**
 * @jest-environment jsdom
 */
import { SearchBox } from '../src/SearchBox';
import { ISearchResult } from '../src/interfaces/ICoffeeApi';
import {
    CAFEE_CHAMOMILE_LUNGO_OFFER,
    DUMMY_RESPONSE,
    dummyCoffeeApi
} from './fixtures/dummyCoffeeApi';
import { mockComposer } from './fixtures/mocks';
import { waitForEvents, defer } from './util';

class TestSearchBox extends SearchBox {
    public buildComposer() {
        return mockComposer;
    }
    public getInputNode() {
        return this.input;
    }
    public getButtonNode() {
        return this.searchButton;
    }
}

describe('SearchBox', () => {
    let searchBox: TestSearchBox;

    beforeEach(() => {
        jest.resetAllMocks();
        document.body.innerHTML = '';
    });

    afterEach(() => searchBox.destroy());

    test(`SearchBox doesn't react on button click if input is empty`, () => {
        const searchMock = jest.spyOn(dummyCoffeeApi, 'search');
        searchBox = new TestSearchBox(document.body, dummyCoffeeApi, {});
        searchBox.getInputNode().value = ' ';
        searchBox.getButtonNode().click();
        expect(searchMock).toBeCalledTimes(0);
        searchBox.destroy();
    });

    test('SearchBox reacts on button click', async () => {
        const searchMock = jest.spyOn(dummyCoffeeApi, 'search');
        searchBox = new TestSearchBox(document.body, dummyCoffeeApi, {});
        searchBox.getInputNode().value = ' test\t';
        const offerLists = await waitForEvents(
            searchBox.events,
            'offerListChange',
            () => {
                searchBox.getButtonNode().click();
            }
        );
        expect(offerLists).toEqual([{ offerList: DUMMY_RESPONSE }]);
        expect(searchMock).toBeCalledTimes(1);
        expect(searchMock).toBeCalledWith('test');
        searchBox.destroy();
    });

    test('SearchBox performs search if the "search" method is called', async () => {
        const searchMock = jest.spyOn(dummyCoffeeApi, 'search');
        searchBox = new TestSearchBox(document.body, dummyCoffeeApi, {});
        searchBox.getInputNode().value = ' test\t';
        const offerLists = await waitForEvents(
            searchBox.events,
            'offerListChange',
            () => {
                searchBox.search('test');
            }
        );
        expect(searchBox.getInputNode().value).toEqual('test');
        expect(offerLists).toEqual([{ offerList: DUMMY_RESPONSE }]);
        expect(searchMock).toBeCalledTimes(1);
        expect(searchMock).toBeCalledWith('test');
        searchBox.destroy();
    });

    test('SearchBox displays only the latest result even if the earlier call came first', async () => {
        const defer1 = defer<ISearchResult[]>();
        const defer2 = defer<ISearchResult[]>();
        const DUMMY_RESPONSE_2 = [
            CAFEE_CHAMOMILE_LUNGO_OFFER,
            CAFEE_CHAMOMILE_LUNGO_OFFER
        ];

        const searchMock = jest
            .spyOn(dummyCoffeeApi, 'search')
            .mockImplementationOnce(() => defer1.promise)
            .mockImplementationOnce(() => defer2.promise);
        searchBox = new TestSearchBox(document.body, dummyCoffeeApi, {});
        const offerList = await waitForEvents(
            searchBox.events,
            'offerListChange',
            () => {
                searchBox.search('test1');
                setTimeout(() => {
                    searchBox.search('test2');
                    defer1.resolve(DUMMY_RESPONSE);
                    defer2.resolve(DUMMY_RESPONSE_2);
                }, 50);
            },
            1
        );
        expect(offerList).toEqual([{ offerList: DUMMY_RESPONSE_2 }]);
        expect(searchMock).toBeCalledTimes(2);
        expect(searchMock).toBeCalledWith('test1');
        expect(searchMock).toBeCalledWith('test2');
        searchBox.destroy();
    });

    test('SearchBox resets results while waiting for a response', async () => {
        searchBox = new TestSearchBox(document.body, dummyCoffeeApi, {});
        await searchBox.search('test1');
        const offerList = await waitForEvents(
            searchBox.events,
            'offerListChange',
            () => {
                searchBox.search('test2');
            },
            2
        );
        expect(offerList).toEqual([
            { offerList: null },
            { offerList: DUMMY_RESPONSE }
        ]);
        searchBox.destroy();
    });

    test('SearchBox creates order upon receiving a "createOrder" event from the composer', () => {
        const createOrderMock = jest.spyOn(dummyCoffeeApi, 'createOrder');
        searchBox = new TestSearchBox(document.body, dummyCoffeeApi, {});
        mockComposer.events.emit('createOrder', {
            offer: CAFEE_CHAMOMILE_LUNGO_OFFER
        });
        expect(createOrderMock).toBeCalledWith({
            offerId: CAFEE_CHAMOMILE_LUNGO_OFFER.offerId
        });
        searchBox.destroy();
    });

    test('SearchBox destroys. Destroyed SearchBox does not react to events', () => {
        const searchMock = jest.spyOn(dummyCoffeeApi, 'search');
        const createOrderMock = jest.spyOn(dummyCoffeeApi, 'createOrder');
        const searchBox = new TestSearchBox(document.body, dummyCoffeeApi, {});
        searchBox.destroy();
        expect(document.body.innerHTML).toEqual('');
        searchBox.getButtonNode().click();
        mockComposer.events.emit('createOrder', {
            offer: CAFEE_CHAMOMILE_LUNGO_OFFER
        });
        expect(searchMock).toBeCalledTimes(0);
        expect(createOrderMock).toBeCalledTimes(0);
        expect(mockComposer.destroy).toBeCalledTimes(1);
        searchBox.destroy();
    });
});
