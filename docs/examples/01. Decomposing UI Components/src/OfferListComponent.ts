/**
 * @fileoverview
 * This file comprises a reference implementation
 * of the `IOfferListComponent` interface called simply `OfferListComponent`
 */

import { attrValue, html, raw } from './util/html';
import {
    IOfferListComponent,
    IOfferListComponentOptions,
    IOfferListComponentEvents
} from './interfaces/IOfferListComponent';
import { IDisposer, IEventEmitter } from './interfaces/common';
import {
    IOfferPreview,
    IOfferPreviewListChangeEvent,
    ISearchBoxComposer
} from './interfaces/ISearchBoxComposer';
import { EventEmitter } from './util/EventEmitter';

/**
 * An `OfferListComponent` visualizes a list of short descriptions
 * of offers (“previews”) and allows for interacting with it.
 *
 * The responsibility of this class is:
 *   * Rendering previews and react on the preview list change event
 *   * Allowing user to select a preview and emit the corresponding event
 */
export class OfferListComponent implements IOfferListComponent {
    /**
     * An accessor to subscribe for events or emit them.
     */
    public events: IEventEmitter<IOfferListComponentEvents> =
        new EventEmitter();
    /**
     * An inner state of the component, whether it's now
     * rendered or not
     */
    protected shown: boolean = false;
    /**
     * Event listeners
     */
    private listenerDisposers: IDisposer[] = [];

    constructor(
        protected readonly context: ISearchBoxComposer,
        protected readonly container: HTMLElement,
        protected offerList: IOfferPreview[] | null,
        protected readonly options: IOfferListComponentOptions
    ) {
        this.listenerDisposers.push(
            this.context.events.on(
                'offerPreviewListChange',
                this.onOfferListChange
            )
        );
        if (offerList !== null) {
            this.show();
        }
    }

    /* Provided for consistency for the developer 
       to have access to the full state
       of the component */
    public getOfferList() {
        return this.offerList;
    }

    /**
     * Destroys the component
     */
    public destroy() {
        this.teardownListeners();
        this.hide();
        this.offerList = null;
    }

    /**
     * Allows for programmatically selecting an
     * offer in the list
     */
    public selectOffer(offerId: string) {
        this.events.emit('offerSelect', {
            offerId
        });
    }

    /**
     * An event handler for the context state change
     * event. Exposed as a protected method to allow
     * for altering the default reaction in subclasses
     */
    protected onOfferListChange = ({
        offerList
    }: IOfferPreviewListChangeEvent) => {
        if (this.shown) {
            this.hide();
        }
        this.offerList = offerList;
        if (offerList !== null) {
            this.show();
        }
    };

    /**
     * A helper method to generate the DOM structure for
     * displaying a preview. Exposed
     */
    protected generateOfferHtml(offer: IOfferPreview): string {
        return html`<li
            class="our-coffee-sdk-offer-list-offer"
            data-offer-id="${attrValue(offer.offerId)}"
        >
            <aside>${offer.price.formattedValue} &gt;</aside>
            ${offer.imageUrl !== undefined
                ? html`<img src="${attrValue(offer.imageUrl)}" />`
                : ''}
            <h3>${offer.title}</h3>
            <p>${offer.subtitle}</p>
            <p>${offer.bottomLine}</p>
        </li>`.toString();
    }

    /**
     * A listener to the DOM 'click' event. Exposed as a shortcut
     * to allow for enriching the UX in subclasses.
     * If we've taken long and 'proper' way, this should be
     * a spearate composer to route events and data flow between
     * the component and its representation.
     */
    protected onClickListener = (e: MouseEvent) => {
        let target = e.target;
        while (target) {
            const offerId = (<HTMLElement>target).dataset?.offerId;
            if (offerId !== undefined) {
                this.onOfferClick(offerId);
                break;
            }
            target = (<HTMLElement>target).parentNode;
        }
    };

    /* A couple of helper methods to render the preview list
       or to dispose the corresponding DOM structure. Exposed to allow
       carrying out additional actions in subclasses if needed */
    protected show() {
        this.container.innerHTML = html`<ul class="our-coffee-sdk-offer-list">
            ${this.offerList === null
                ? ''
                : this.offerList.map((offer) =>
                      raw(this.generateOfferHtml(offer))
                  )}
        </ul>`.toString();
        this.setupDomListeners();
        this.shown = true;
    }

    protected hide() {
        this.teardownDomListeners();
        this.container.innerHTML = '';
        this.shown = false;
    }

    /* Various methods to work with events */
    private onOfferClick(offerId: string) {
        this.selectOffer(offerId);
    }

    private setupDomListeners() {
        this.container.addEventListener('click', this.onClickListener, false);
    }

    private teardownListeners() {
        for (const disposer of this.listenerDisposers) {
            disposer.off();
        }
        this.listenerDisposers = [];
    }

    private teardownDomListeners() {
        this.container.removeEventListener(
            'click',
            this.onClickListener,
            false
        );
    }
}
