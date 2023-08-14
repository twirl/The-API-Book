/**
 * @fileoverview
 * This file comprises a reference implementation
 * of the `IButton` interface adapted for using with
 * the `OfferPanelComponent` parent element
 */

import { IButton, IButtonEvents, IButtonOptions } from './interfaces/IButton';
import { IEventEmitter } from './interfaces/common';
import { EventEmitter } from './util/EventEmitter';
import { $, attrValue, html, raw } from './util/html';

/**
 * Displays an UI element that represents a call to action
 * for a user.
 *
 * The responsibility of this class is:
 *   * Rendering the corresponding UI
 *   * Emitting 'press' events
 */
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
            class="our-coffee-sdk-offer-panel-button"
        >
            ${this.options.iconUrl
                ? html`<img src="${attrValue(this.options.iconUrl)}" />`
                : ''}
            <span>${raw(this.options.text)}</span>
        </button>`.toString();
        this.button = $<HTMLButtonElement>(
            this.container,
            '.our-coffee-sdk-offer-panel-button'
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
