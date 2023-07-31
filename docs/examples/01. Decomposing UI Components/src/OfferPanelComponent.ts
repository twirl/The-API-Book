import { omitUndefined } from '../test/util';
import { CloseButton, CreateOrderButton } from './OfferPanelButton';
import { IButton, IButtonPressEvent } from './interfaces/IButton';
import {
    IOfferPanelComponent,
    IOfferPanelComponentEvents,
    IOfferPanelComponentOptions
} from './interfaces/IOfferPanelComponent';
import {
    IOfferFullView,
    ISearchBoxComposer
} from './interfaces/ISearchBoxComposer';
import { IDisposer, IEventEmitter, IExtraFields } from './interfaces/common';
import { EventEmitter } from './util/EventEmitter';
import { $, html } from './util/html';

export class OfferPanelComponent implements IOfferPanelComponent {
    public events: IEventEmitter<IOfferPanelComponentEvents> =
        new EventEmitter();

    protected buttonsContainer: HTMLElement | null = null;
    protected buttons: Array<{
        button: IButton;
        listenerDisposer: IDisposer;
        container: HTMLElement;
    }> = [];
    protected listenerDisposers: IDisposer[] = [];

    protected shown: boolean = false;

    constructor(
        protected readonly context: ISearchBoxComposer,
        protected readonly container: HTMLElement,
        protected currentOffer: IOfferFullView | null,
        protected readonly options: OfferPanelComponentOptions
    ) {
        this.listenerDisposers.push(
            this.context.events.on(
                'offerFullViewToggle',
                this.onOfferFullViewToggle
            )
        );
        if (currentOffer !== null) {
            this.show();
        }
    }

    public static buildCreateOrderButton: ButtonBuilder = (
        offer,
        container,
        options
    ) =>
        new CreateOrderButton(
            container,
            omitUndefined({
                iconUrl: options.createOrderButtonUrl,
                text: options.createOrderButtonText
            })
        );

    public static buildCloseButton: ButtonBuilder = (
        offer,
        container,
        options
    ) =>
        new CloseButton(
            container,
            omitUndefined({
                iconUrl: options.closeButtonUrl,
                text: options.closeButtonText
            })
        );

    public getOffer(): IOfferFullView | null {
        return this.currentOffer;
    }

    public destroy() {
        this.currentOffer = null;
        for (const disposer of this.listenerDisposers) {
            disposer.off();
        }
        if (this.shown) {
            this.hide();
        }
    }

    protected show() {
        this.container.innerHTML = html`<div class="our-coffee-sdk-offer-panel">
            <h1>${this.currentOffer.title}</h1>
            ${this.currentOffer.description.map(
                (description) => html`<p>${description}</p>`
            )}
            <ul class="our-coffee-sdk-offer-panel-buttons"></ul>
        </div>`.toString();
        this.buttonsContainer = $(
            this.container,
            '.our-coffee-sdk-offer-panel-buttons'
        );
        if (!this.options.transparent) {
            this.container.classList.add('our-coffee-sdk-cover-blur');
        }
        this.setupButtons();
        this.shown = true;
    }

    protected hide() {
        this.destroyButtons();
        this.buttonsContainer = null;
        this.container.innerHTML = '';
        this.container.classList.remove('our-coffee-sdk-cover-blur');
        this.shown = false;
    }

    protected setupButtons() {
        const buttonBuilders = this.options.buttonBuilders ?? [
            OfferPanelComponent.buildCreateOrderButton,
            OfferPanelComponent.buildCloseButton
        ];
        for (const buttonBuilder of buttonBuilders) {
            const container = document.createElement('li');
            this.buttonsContainer.appendChild(container);
            const button = buttonBuilder(
                this.currentOffer,
                container,
                this.options
            );
            const listenerDisposer = button.events.on(
                'press',
                this.onButtonPress
            );
            this.buttons.push({ button, listenerDisposer, container });
        }
    }

    protected destroyButtons() {
        for (const { button, listenerDisposer, container } of this.buttons) {
            listenerDisposer.off();
            button.destroy();
            container.parentNode.removeChild(container);
        }
        this.buttons = [];
    }

    protected onOfferFullViewToggle = ({ offer }) => {
        if (this.shown) {
            this.hide();
        }
        this.currentOffer = offer;
        if (offer) {
            this.show();
        }
    };

    protected onButtonPress = ({ target }: IButtonPressEvent) => {
        if (this.currentOffer !== null) {
            this.events.emit('action', {
                action: target.action,
                target,
                currentOfferId: this.currentOffer.offerId
            });
        } else {
            // TBD
        }
    };
}

export interface OfferPanelComponentOptions
    extends IOfferPanelComponentOptions {
    buttonBuilders?: ButtonBuilder[];
    transparent?: boolean;
}

export type ButtonBuilder = (
    context: IOfferFullView,
    container: HTMLElement,
    options: IOfferPanelComponentOptions
) => IButton;
