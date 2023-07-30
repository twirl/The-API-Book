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

export class OfferListComponent implements IOfferListComponent {
    public events: IEventEmitter<IOfferListComponentEvents> =
        new EventEmitter();

    protected listenerDisposers: IDisposer[] = [];

    protected shown: boolean = false;

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

    public getOfferList() {
        return this.offerList;
    }

    public destroy() {
        this.teardownListeners();
        this.hide();
        this.offerList = null;
    }

    public selectOffer(offerId: string) {
        this.events.emit('offerSelect', {
            offerId
        });
    }

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
