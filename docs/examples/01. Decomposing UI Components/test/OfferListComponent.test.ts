/**
 * @jest-environment jsdom
 */

import { OfferListComponent } from '../src/OfferListComponent';
import { $ } from '../src/util/html';
import {
    CAFEE_CHAMOMILE_LUNGO_OFFER_PREVIEW,
    DUMMY_PREVIEWS
} from './fixtures/dummyCoffeeApi';
import { mockComposer } from './fixtures/mocks';
import { waitForEvents } from './util';

const FAKE_OFFER_ID = 'fakeOfferId';

class TestOfferListComponent extends OfferListComponent {
    public isShown() {
        return this.shown;
    }
    public generateOfferHtml(offer: any) {
        return super.generateOfferHtml(offer);
    }
}

describe('OfferListComponent', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        document.body.innerHTML = '';
    });

    test('OfferListComponent instantiates hidden if the list of offers is null', () => {
        const offerList = new TestOfferListComponent(
            mockComposer,
            document.body,
            null,
            {}
        );
        expect(offerList.isShown()).toEqual(false);
        offerList.destroy();
    });

    test('OfferListComponent instantiates shown if the list of offers is not null', () => {
        const offerList = new TestOfferListComponent(
            mockComposer,
            document.body,
            DUMMY_PREVIEWS,
            {}
        );
        expect(offerList.isShown()).toEqual(true);
        offerList.destroy();
    });

    test('OfferListComponent emits a "selectOffer" event on click', async () => {
        const offerList = new TestOfferListComponent(
            mockComposer,
            document.body,
            [CAFEE_CHAMOMILE_LUNGO_OFFER_PREVIEW],
            {}
        );
        const item = $<HTMLElement>(document.body, 'h3');
        const events = await waitForEvents(
            offerList.events,
            'offerSelect',
            () => {
                item.click();
            }
        );
        expect(events).toEqual([
            {
                offerId: CAFEE_CHAMOMILE_LUNGO_OFFER_PREVIEW.offerId
            }
        ]);
        offerList.destroy();
    });

    test('OfferListComponent.selectOffer emits a "selectOffer" event', async () => {
        const offerList = new TestOfferListComponent(
            mockComposer,
            document.body,
            DUMMY_PREVIEWS,
            {}
        );
        const events = await waitForEvents(
            offerList.events,
            'offerSelect',
            () => {
                offerList.selectOffer(
                    CAFEE_CHAMOMILE_LUNGO_OFFER_PREVIEW.offerId
                );
            }
        );
        expect(events).toEqual([
            {
                offerId: CAFEE_CHAMOMILE_LUNGO_OFFER_PREVIEW.offerId
            }
        ]);
        offerList.destroy();
    });

    test('OfferListComponent.selectOffer translates any offer, even an unknown one', async () => {
        const offerList = new TestOfferListComponent(
            mockComposer,
            document.body,
            DUMMY_PREVIEWS,
            {}
        );
        const events = await waitForEvents(
            offerList.events,
            'offerSelect',
            () => {
                offerList.selectOffer(FAKE_OFFER_ID);
            }
        );
        expect(events).toEqual([
            {
                offerId: FAKE_OFFER_ID
            }
        ]);
        offerList.destroy();
    });

    test('OfferListComponents hides when receive a null "offerListChange" event', () => {
        const offerList = new TestOfferListComponent(
            mockComposer,
            document.body,
            DUMMY_PREVIEWS,
            {}
        );
        const generateItemMock = jest.spyOn(offerList, 'generateOfferHtml');
        mockComposer.events.emit('offerPreviewListChange', {
            offerList: null
        });
        expect(offerList.isShown()).toEqual(false);
        expect(generateItemMock).toBeCalledTimes(0);
        offerList.destroy();
    });

    test('OfferListComponents re-renders when receive a "offerListChange" event while being shown', () => {
        const offerList = new TestOfferListComponent(
            mockComposer,
            document.body,
            DUMMY_PREVIEWS,
            {}
        );
        const generateItemMock = jest.spyOn(offerList, 'generateOfferHtml');
        mockComposer.events.emit('offerPreviewListChange', {
            offerList: [CAFEE_CHAMOMILE_LUNGO_OFFER_PREVIEW]
        });
        expect(offerList.isShown()).toEqual(true);
        expect(generateItemMock).toBeCalledTimes(1);
        offerList.destroy();
    });

    test('OfferListComponents shows when receive a "offerListChange" event while being hidden', () => {
        const offerList = new TestOfferListComponent(
            mockComposer,
            document.body,
            null,
            {}
        );
        const generateItemMock = jest.spyOn(offerList, 'generateOfferHtml');
        mockComposer.events.emit('offerPreviewListChange', {
            offerList: [CAFEE_CHAMOMILE_LUNGO_OFFER_PREVIEW]
        });
        expect(offerList.isShown()).toEqual(true);
        expect(generateItemMock).toBeCalledTimes(1);
        offerList.destroy();
    });

    test('OfferListComponent destroys and no longer reacts on events', async () => {
        const offerList = new TestOfferListComponent(
            mockComposer,
            document.body,
            [CAFEE_CHAMOMILE_LUNGO_OFFER_PREVIEW],
            {}
        );
        const events = [];
        const item = $<HTMLElement>(document.body, 'h3');
        offerList.events.on('offerSelect', (e) => {
            events.push(e);
        });
        offerList.destroy();
        item.click();
        expect(document.body.innerHTML).toEqual('');
        expect(events).toEqual([]);
        offerList.destroy();
    });
});
