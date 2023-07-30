/**
 * @jest-environment jsdom
 */

import { CloseButton, CreateOrderButton } from '../src/OfferPanelButton';
import { OfferPanelComponent } from '../src/OfferPanelComponent';
import { IButton } from '../src/interfaces/IButton';
import { EventEmitter } from '../src/util/EventEmitter';
import { CAFEE_CHAMOMILE_LUNGO_OFFER_FULL_VIEW } from './fixtures/dummyCoffeeApi';
import { mockComposer } from './fixtures/mocks';
import { waitForEvents } from './util';

const MOCK_ACTION = 'mockAction';
const mockButton: IButton = {
    action: MOCK_ACTION,
    events: new EventEmitter(),
    destroy: jest.fn()
};

class TestOfferPanelComponent extends OfferPanelComponent {
    public isShown() {
        return this.shown;
    }

    public getButtons() {
        return this.buttons;
    }
}

describe('OfferPanelComponent', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        document.body.innerHTML = '';
    });

    test('OfferPanelComponent instantiates hidden if no offer is selected', () => {
        const offerPanel = new TestOfferPanelComponent(
            mockComposer,
            document.body,
            null,
            {}
        );
        expect(offerPanel.isShown()).toEqual(false);
        offerPanel.destroy();
    });

    test('OfferPanelComponent instantiates with default buttons', () => {
        const offerPanel = new TestOfferPanelComponent(
            mockComposer,
            document.body,
            CAFEE_CHAMOMILE_LUNGO_OFFER_FULL_VIEW,
            {}
        );
        expect(offerPanel.isShown()).toEqual(true);
        const buttons = offerPanel.getButtons();
        expect(buttons[0].button instanceof CreateOrderButton).toEqual(true);
        expect(buttons[1].button instanceof CloseButton).toEqual(true);
        offerPanel.destroy();
    });

    test('OfferPanelComponent instantiates with custom buttons', () => {
        const offerPanel = new TestOfferPanelComponent(
            mockComposer,
            document.body,
            CAFEE_CHAMOMILE_LUNGO_OFFER_FULL_VIEW,
            {
                buttonBuilders: [
                    () => mockButton,
                    OfferPanelComponent.buildCloseButton
                ]
            }
        );
        expect(offerPanel.isShown()).toEqual(true);
        const buttons = offerPanel.getButtons();
        expect(buttons[0].button).toEqual(mockButton);
        expect(buttons[1].button instanceof CloseButton).toEqual(true);
        offerPanel.destroy();
    });

    test('OfferPanelComponent hides after receiving null offer in onOfferFullViewToggle listener', () => {
        const container = document.body;
        const offerPanel = new TestOfferPanelComponent(
            mockComposer,
            container,
            CAFEE_CHAMOMILE_LUNGO_OFFER_FULL_VIEW,
            {}
        );
        mockComposer.events.emit('offerFullViewToggle', { offer: null });
        expect(offerPanel.isShown()).toEqual(false);
        expect(offerPanel.getButtons().length).toEqual(0);
        offerPanel.destroy();
    });

    test('OfferPanelComponent shows after receiving non-null offer in onOfferFullViewToggle listener', () => {
        const offerPanel = new TestOfferPanelComponent(
            mockComposer,
            document.body,
            null,
            { buttonBuilders: [() => mockButton] }
        );
        mockComposer.events.emit('offerFullViewToggle', {
            offer: CAFEE_CHAMOMILE_LUNGO_OFFER_FULL_VIEW
        });
        expect(offerPanel.isShown()).toEqual(true);
        expect(offerPanel.getButtons()).toEqual([
            expect.objectContaining({ button: mockButton })
        ]);
        offerPanel.destroy();
    });

    test('OfferPanelComponent re-render after receiving another non-null offer in onOfferFullViewToggle listener', () => {
        const offerPanel = new TestOfferPanelComponent(
            mockComposer,
            document.body,
            CAFEE_CHAMOMILE_LUNGO_OFFER_FULL_VIEW,
            { buttonBuilders: [() => mockButton] }
        );
        mockComposer.events.emit('offerFullViewToggle', {
            offer: CAFEE_CHAMOMILE_LUNGO_OFFER_FULL_VIEW
        });
        expect(offerPanel.isShown()).toEqual(true);
        expect(offerPanel.getButtons()).toEqual([
            expect.objectContaining({ button: mockButton })
        ]);
        offerPanel.destroy();
    });

    test('OfferPanelComponent emits an "action" event on button press', async () => {
        const offerPanel = new TestOfferPanelComponent(
            mockComposer,
            document.body,
            CAFEE_CHAMOMILE_LUNGO_OFFER_FULL_VIEW,
            { buttonBuilders: [() => mockButton] }
        );
        const events = await waitForEvents(offerPanel.events, 'action', () => {
            mockButton.events.emit('press', { target: mockButton });
        });
        expect(events).toEqual([
            {
                offerId: CAFEE_CHAMOMILE_LUNGO_OFFER_FULL_VIEW.offerId,
                action: MOCK_ACTION
            }
        ]);
        offerPanel.destroy();
    });

    test('OfferPanelComponent destroys and no longer reacts on events', async () => {
        const offerPanel = new TestOfferPanelComponent(
            mockComposer,
            document.body,
            CAFEE_CHAMOMILE_LUNGO_OFFER_FULL_VIEW,
            { buttonBuilders: [() => mockButton] }
        );
        const events = [];
        offerPanel.events.on('action', (e) => events.push(e));
        offerPanel.destroy();
        mockButton.events.emit('press', { target: mockButton });
        mockComposer.events.emit('offerFullViewToggle', {
            offer: CAFEE_CHAMOMILE_LUNGO_OFFER_FULL_VIEW
        });
        expect(events.length).toEqual(0);
        expect(offerPanel.isShown()).toEqual(false);
        expect(document.body.innerHTML).toEqual('');
    });
});
