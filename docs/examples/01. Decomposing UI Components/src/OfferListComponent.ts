import { attrValue, html, raw } from './util/html';
import {
    IOfferListComponent,
    IOfferListComponentOptions,
    IOfferListEvents
} from './interfaces/IOfferListComponent';
import { IDisposer, IEventEmitter } from './interfaces/common';
import {
    IOfferPreview,
    ISearchBoxComposer
} from './interfaces/ISearchBoxComposer';
import { EventEmitter } from './util/EventEmitter';

export class OfferListComponent implements IOfferListComponent {
    public events: IEventEmitter<IOfferListEvents> = new EventEmitter();

    protected listenerDisposers: IDisposer[] = [];

    constructor(
        protected readonly context: ISearchBoxComposer,
        protected readonly container: HTMLElement,
        protected offerList: IOfferPreview[] | null,
        protected readonly options: IOfferListComponentOptions
    ) {
        this.render();
        this.setupListeners();
    }

    protected onOfferListChange({ offerList }) {
        this.offerList = offerList;
        this.render();
    }

    public getOfferList() {
        return this.offerList;
    }

    public destroy() {
        this.teardownListeners();
        this.teardownDomListeners();
        this.offerList = null;
        this.container.innerHTML = '';
    }

    public selectOffer(offerId: string) {
        this.events.emit('offerSelect', {
            offerId
        });
    }

    protected render() {
        this.teardownDomListeners();
        this.container.innerHTML = html`<ul class="our-coffee-api-offer-list">
            ${this.offerList === null
                ? ''
                : this.offerList.map((offer) =>
                      raw(this.generateOfferHtml(offer))
                  )}
        </ul>`.toString();
        this.setupDomListeners();
    }

    protected generateOfferHtml(offer: IOfferPreview): string {
        return html`<li
            class="our-coffee-api-offer-list-offer"
            data-offer-id="${attrValue(offer.offerId)}"
        >
            ${offer.imageUrl !== undefined
                ? `<img src="${attrValue(offer.imageUrl)}">`
                : ''}
            <h3>${offer.title}</h3>
            <p>${offer.subtitle}</p>
            <p>${offer.bottomLine}</p>
            <aside>${offer.price.formattedValue}</aside>
        </li>`.toString();
    }

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

    protected onOfferClick(offerId: string) {
        this.selectOffer(offerId);
    }

    protected setupListeners() {
        this.listenerDisposers.push(
            this.context.events.on(
                'offerPreviewListChange',
                this.onOfferListChange
            )
        );
    }

    protected setupDomListeners() {
        this.container.addEventListener('click', this.onClickListener, false);
    }

    protected teardownListeners() {
        for (const disposer of this.listenerDisposers) {
            disposer.off();
        }
        this.listenerDisposers = [];
    }

    protected teardownDomListeners() {
        this.container.removeEventListener(
            'click',
            this.onClickListener,
            false
        );
    }
}
