/**
 * @jest-environment jsdom
 */
import { SearchBoxComposer } from '../src/SearchBoxComposer';
import {
    CAFEE_CHAMOMILE_LUNGO_OFFER,
    DUMMY_RESPONSE
} from './fixtures/dummyCoffeeApi';
import { mockOfferList, mockOfferPanel, mockSearchBox } from './fixtures/mocks';
import { waitForEvents } from './util';

class TestComposer extends SearchBoxComposer {
    public buildOfferListComponent() {
        return mockOfferList;
    }
    public buildOfferPanelComponent() {
        return mockOfferPanel;
    }
    public generateOfferPreviews(offerList: any, options: any) {
        return super.generateOfferPreviews(offerList, options);
    }
    public generateCurrentOfferFullView(offer: any, options: any) {
        return super.generateCurrentOfferFullView(offer, options);
    }
}

describe('SearchBoxComposer', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        document.body.innerHTML = '';
    });
    test('Composer renders sub-components', () => {
        const container = document.body;
        const buildOfferListMock = jest.spyOn(
            TestComposer.prototype,
            'buildOfferListComponent'
        );
        const buildOfferPanelMock = jest.spyOn(
            TestComposer.prototype,
            'buildOfferPanelComponent'
        );
        const composer = new TestComposer(mockSearchBox, container, {});
        expect(buildOfferListMock).toBeCalledTimes(1);
        expect(buildOfferPanelMock).toBeCalledTimes(1);
        composer.destroy();
    });

    test('Composer destroy itself and destroys sub-components', () => {
        const container = document.body;
        const composer = new TestComposer(mockSearchBox, container, {});
        composer.destroy();
        // Sending context events after composer
        // destruction shall not result in exception
        mockSearchBox.events.emit('offerListChange', {
            offerList: DUMMY_RESPONSE
        });
        expect(mockOfferList.destroy).toBeCalledTimes(1);
        expect(mockOfferPanel.destroy).toBeCalledTimes(1);
        expect(container.innerHTML).toEqual('');
    });

    test('Composer finds an offer by its id', () => {
        const composer = new TestComposer(mockSearchBox, document.body, {});
        mockSearchBox.events.emit('offerListChange', {
            offerList: DUMMY_RESPONSE
        });
        expect(
            composer.findOfferById(CAFEE_CHAMOMILE_LUNGO_OFFER.offerId)
        ).toEqual(CAFEE_CHAMOMILE_LUNGO_OFFER);
        composer.destroy();
    });

    test('Composer returns null if an offer cannot be found', () => {
        const composer = new TestComposer(mockSearchBox, document.body, {});
        const FAKE_OFFER_ID = 'fakeOfferId';
        expect(composer.findOfferById(FAKE_OFFER_ID)).toEqual(null);
        mockSearchBox.events.emit('offerListChange', {
            offerList: DUMMY_RESPONSE
        });
        expect(composer.findOfferById(FAKE_OFFER_ID)).toEqual(null);
        composer.destroy();
    });

    test('Context offerListChange event is translated as offerPreviewListChange event', async () => {
        const composer = new TestComposer(mockSearchBox, document.body, {});
        const previewsMock = jest.spyOn(composer, 'generateOfferPreviews');
        const events = await waitForEvents(
            composer.events,
            'offerPreviewListChange',
            () => {
                mockSearchBox.events.emit('offerListChange', {
                    offerList: DUMMY_RESPONSE
                });
            }
        );
        expect(previewsMock).toBeCalledTimes(1);
        expect(events).toEqual([
            { offerList: composer.generateOfferPreviews(DUMMY_RESPONSE, {}) }
        ]);
        composer.destroy();
    });

    test('Offer full view is toggled when a "selectOffer" event is received', async () => {
        const composer = new TestComposer(mockSearchBox, document.body, {});
        const fullViewMock = jest.spyOn(
            composer,
            'generateCurrentOfferFullView'
        );
        mockSearchBox.events.emit('offerListChange', {
            offerList: DUMMY_RESPONSE
        });
        const events = await waitForEvents(
            composer.events,
            'offerFullViewToggle',
            () => {
                mockOfferList.events.emit('offerSelect', {
                    offerId: CAFEE_CHAMOMILE_LUNGO_OFFER.offerId
                });
            }
        );
        expect(fullViewMock).toBeCalledTimes(1);
        expect(events).toEqual([
            {
                offer: composer.generateCurrentOfferFullView(
                    CAFEE_CHAMOMILE_LUNGO_OFFER,
                    {}
                )
            }
        ]);
        composer.destroy();
    });

    test('currentOffer is null-ed when offerList changes', async () => {
        const composer = new TestComposer(mockSearchBox, document.body, {});
        mockSearchBox.events.emit('offerListChange', {
            offerList: DUMMY_RESPONSE
        });
        mockOfferList.events.emit('offerSelect', {
            offerId: CAFEE_CHAMOMILE_LUNGO_OFFER.offerId
        });
        const events = await waitForEvents(
            composer.events,
            'offerFullViewToggle',
            () => {
                mockSearchBox.events.emit('offerListChange', {
                    offerList: DUMMY_RESPONSE
                });
            }
        );
        expect(events.length).toEqual(1);
        composer.destroy();
    });

    test('creatOrder event is emitted when a "createOrder" action is received', async () => {
        const composer = new TestComposer(mockSearchBox, document.body, {});
        mockSearchBox.events.emit('offerListChange', {
            offerList: DUMMY_RESPONSE
        });
        const events = await waitForEvents(
            composer.events,
            'createOrder',
            () => {
                mockOfferPanel.events.emit('action', {
                    currentOfferId: CAFEE_CHAMOMILE_LUNGO_OFFER.offerId,
                    action: 'createOrder'
                });
            }
        );
        expect(events).toEqual([{ offer: CAFEE_CHAMOMILE_LUNGO_OFFER }]);
        composer.destroy();
    });

    test('Nothing happens if an unknown offer is received with a "createOrder" action', async () => {
        const composer = new TestComposer(mockSearchBox, document.body, {});
        mockSearchBox.events.emit('offerListChange', {
            offerList: DUMMY_RESPONSE
        });
        let event = null;
        composer.events.on('createOrder', (e) => {
            event = e;
        });
        mockOfferPanel.events.emit('action', {
            currentOfferId: 'fakeOfferId',
            action: 'createOrder'
        });
        expect(event).toEqual(null);
        composer.destroy();
    });

    test('Offer full view is toggled when a "close" action is received', async () => {
        const composer = new TestComposer(mockSearchBox, document.body, {});
        mockSearchBox.events.emit('offerListChange', {
            offerList: DUMMY_RESPONSE
        });
        mockOfferList.events.emit('offerSelect', {
            offerId: CAFEE_CHAMOMILE_LUNGO_OFFER.offerId
        });
        const events = await waitForEvents(
            composer.events,
            'offerFullViewToggle',
            () => {
                mockOfferPanel.events.emit('action', {
                    currentOfferId: CAFEE_CHAMOMILE_LUNGO_OFFER.offerId,
                    action: 'close'
                });
            }
        );
        expect(events).toEqual([{ offer: null }]);
        composer.destroy();
    });
});
