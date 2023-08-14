/**
 * @fileoverview
 * This file comprises a reference implementation
 * of the `IOfferPanelComponent` interface called simply `OfferPanelComponent`
 */

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
import { IDisposer, IEventEmitter } from './interfaces/common';
import { EventEmitter } from './util/EventEmitter';
import { $, html } from './util/html';

/**
 * A `OfferPanelComponent` represents a UI to display
 * the detailed information regarding an offer (a “full view”)
 * implying that user can act on the offer (for example,
 * to create an order).
 *
 * The responsibility of the component is:
 *   * Displaying detailed information regarding an offer
 *     and update it if the corresponding context state
 *     change event happens
 *   * Rendering “buttons,” i.e. the control elements
 *     for user to express their intentions
 *   * Emitting “actions” when the user interacts with the buttons
 *   * Closing itself if needed
 */
export class OfferPanelComponent implements IOfferPanelComponent {
    /**
     * An accessor to subscribe for events or emit them.
     */
    public events: IEventEmitter<IOfferPanelComponentEvents> =
        new EventEmitter();
    /**
     * A DOM element container for buttons
     */
    protected buttonsContainer: HTMLElement | null = null;
    /**
     * An array of currently displayed buttons
     */
    protected buttons: Array<{
        button: IButton;
        listenerDisposer: IDisposer;
        container: HTMLElement;
    }> = [];
    /**
     * Event listeners
     */
    protected listenerDisposers: IDisposer[] = [];
    /**
     * An inner state of the component, whether it's open
     * or closed
     */
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

    /**
     * A static helper function to build a specific button
     * for creating orders
     */
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

    /**
     * A static helper function to build a specific button
     * for closing the panel
     */
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

    /* Exposed for consistency */
    public getOffer(): IOfferFullView | null {
        return this.currentOffer;
    }

    /**
     * Destroys the panel and its buttons
     */
    public destroy() {
        this.currentOffer = null;
        for (const disposer of this.listenerDisposers) {
            disposer.off();
        }
        if (this.shown) {
            this.hide();
        }
    }

    /* A pair of helper methods to show and hide the panel */
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

    /**
     * Instantiates all buttons when a new offer is to be
     * displayed. Exposed as a protected method to allow for
     * an additional UX functionality in subclasses
     */
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

    /**
     * Destroys all buttons once the panel is hidden
     */
    protected destroyButtons() {
        for (const { button, listenerDisposer, container } of this.buttons) {
            listenerDisposer.off();
            button.destroy();
            container.parentNode.removeChild(container);
        }
        this.buttons = [];
    }

    /**
     * A listener for the parent context's state change.
     * Exposed as a protected method to allow for adding additional
     * functionality
     */
    protected onOfferFullViewToggle = ({ offer }) => {
        if (this.shown) {
            this.hide();
        }
        this.currentOffer = offer;
        if (offer) {
            this.show();
        }
    };

    /**
     * A listener for button pressing events. Exposed
     * as a protected method to allow for adding custom
     * reactions
     */
    protected onButtonPress = ({ target }: IButtonPressEvent) => {
        if (this.currentOffer !== null) {
            this.events.emit('action', {
                action: target.action,
                target,
                currentOfferId: this.currentOffer.offerId
            });
        }
    };
}

/**
 * `OfferPanelComponent` options
 */
export interface OfferPanelComponentOptions
    extends IOfferPanelComponentOptions {
    /**
     * An array of factory methods to initialize
     * buttons
     */
    buttonBuilders?: ButtonBuilder[];
    /**
     * A UI options, whether an Offer Panel
     * fully disables the interactivity of the
     * underlying markup, or allows for interacting with it
     */
    transparent?: boolean;
}

export type ButtonBuilder = (
    context: IOfferFullView,
    container: HTMLElement,
    options: IOfferPanelComponentOptions
) => IButton;
