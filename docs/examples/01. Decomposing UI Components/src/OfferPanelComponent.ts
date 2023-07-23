import {
    IButton,
    IButtonEvents,
    IButtonOptions,
    IButtonPressEvent
} from './interfaces/IButton';
import {
    IOfferPanelComponent,
    IOfferPanelComponentEvents,
    IOfferPanelComponentOptions
} from './interfaces/IOfferPanelComponent';
import {
    IOfferFullView,
    ISearchBoxComposer
} from './interfaces/ISearchBoxComposer';
import { IDisposer, IEventEmitter } from './interfaces/common';
import { EventEmitter } from './util/EventEmitter';
import { $, attrValue, html } from './util/html';

export class OfferPanelComponent implements IOfferPanelComponent {
    public events: IEventEmitter<IOfferPanelComponentEvents> =
        new EventEmitter();

    protected buttons: Array<{
        button: IButton;
        listenerDisposer: IDisposer;
    }>;
    protected listenerDisposers: IDisposer[] = [];

    constructor(
        protected readonly context: ISearchBoxComposer,
        protected readonly container: HTMLElement,
        protected currentOffer: IOfferFullView | null = null,
        protected readonly options: IOfferPanelComponentOptions,
        protected readonly buttonBuilders: ButtonBuilder[] = [
            OfferPanelComponent.buildCreateOrderButton,
            OfferPanelComponent.buildCloseButton
        ]
    ) {
        this.render();
        this.setupButtons();
        this.listenerDisposers.push(
            this.context.events.on('offerFullViewToggle', ({ offer }) => {
                this.currentOffer = offer;
                this.render();
            })
        );
    }

    public static buildCreateOrderButton: ButtonBuilder = (
        container,
        options
    ) =>
        new CreateOrderButton(container, {
            iconUrl: options.createOrderButtonUrl,
            text: options.createOrderButtonText
        });

    public static buildCloseButton: ButtonBuilder = (container, options) =>
        new CloseButton(container, {
            iconUrl: options.closeButtonUrl,
            text: options.closeButtonText
        });

    public destroy() {
        this.currentOffer = null;
        for (const disposer of this.listenerDisposers) {
            disposer.off();
        }
        this.destroyButtons();
        this.container.innerHTML = '';
    }

    protected render() {
        this.destroyButtons();
        this.container.innerHTML =
            this.currentOffer === null
                ? ''
                : html`<h1>${this.currentOffer.title}</h1>
                      ${this.currentOffer.description.map(
                          (description) => html`<p>${description}</p>`
                      )}
                      <ul
                          class="out-coffee-sdk-offer-panel-buttons"
                      ></ul>`.toString();
        this.setupButtons();
    }

    protected setupButtons() {
        const buttonsContainer = $(
            this.container,
            '.out-coffee-sdk-offer-panel-buttons'
        );
        for (const buttonBuilder of this.buttonBuilders) {
            const buttonContainer = document.createElement('li');
            buttonsContainer.appendChild(buttonContainer);
            const button = buttonBuilder(buttonContainer, this.options);
            const listenerDisposer = button.events.on(
                'press',
                this.onButtonPress
            );
            this.buttons.push({ button, listenerDisposer });
        }
    }

    protected destroyButtons() {
        for (const { button, listenerDisposer } of this.buttons) {
            listenerDisposer.off();
            button.destroy();
        }
        this.buttons = [];
        $(this.container, '.out-coffee-sdk-offer-panel-buttons').innerHTML = '';
    }

    protected onButtonPress = ({ target: { action } }: IButtonPressEvent) => {
        if (this.currentOffer !== null) {
            this.events.emit('action', {
                action,
                offerId: this.currentOffer.offerId
            });
        } else {
            // TBD
        }
    };
}

export type ButtonBuilder = (
    container: HTMLElement,
    options: IOfferPanelComponentOptions
) => IButton;

export class OfferPanelButton implements IButton {
    public events: IEventEmitter<IButtonEvents> = new EventEmitter();

    protected onClickListener = () => {
        this.events.emit('press', { target: this });
    };

    protected button: HTMLButtonElement;

    constructor(
        public readonly action: string,
        protected readonly container: HTMLElement,
        protected readonly options: IButtonOptions
    ) {
        this.container.innerHTML = html`<button
            class="our-coffee-api-sdk-offer-panel-button"
        >
            ${this.options.iconUrl
                ? html`<img src="${attrValue(this.options.iconUrl)}" />`
                : ''}
            <span>${this.options.text}</span>
        </button>`.toString();
        this.button = $<HTMLButtonElement>(
            this.container,
            '.our-coffee-api-sdk-offer-panel-button'
        );

        this.button.addEventListener('click', this.onClickListener, false);
    }

    destroy() {
        this.button.removeEventListener('click', this.onClickListener, false);
        this.container.innerHTML = '';
    }
}

export class CreateOrderButton extends OfferPanelButton {
    constructor(container: HTMLElement, options: Partial<IButtonOptions>) {
        super('createOrder', container, {
            text: 'Place an Order',
            ...options
        });
        this.button.classList.add(
            'our-coffee-sdk-offer-panel-create-order-button'
        );
    }
}

export class CloseButton extends OfferPanelButton {
    constructor(container: HTMLElement, options: Partial<IButtonOptions>) {
        super('close', container, {
            text: 'Not Now',
            ...options
        });
        this.button.classList.add('our-coffee-sdk-offer-panel-close-button');
    }
}
