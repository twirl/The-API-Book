/**
 * @jest-environment jsdom
 */
import { OfferPanelButton } from '../src/OfferPanelButton';
import { waitForEvents } from './util';

const TEST_ACTION = 'testAction';
const TEST_BUTTON_TEXT = 'testButtonText';

class TestButton extends OfferPanelButton {
    constructor(container: HTMLElement) {
        super(TEST_ACTION, container, { text: TEST_BUTTON_TEXT });
    }
    public getButtonElement() {
        return this.button;
    }
}

describe('OfferPanelButton', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        document.body.innerHTML = '';
    });

    test('Button emits a "press" event when clicked', async () => {
        const button = new TestButton(document.body);
        const events = await waitForEvents(button.events, 'press', () => {
            button.getButtonElement().click();
        });
        expect(events).toEqual([
            {
                target: button
            }
        ]);
        button.destroy();
    });

    test('Button destroys and does not respond when clicked', async () => {
        const button = new TestButton(document.body);
        const buttonElement = button.getButtonElement();
        const events = [];
        button.events.on('press', (e) => {
            events.push(e);
        });
        button.destroy();
        buttonElement.click();
        expect(events).toEqual([]);
    });
});
