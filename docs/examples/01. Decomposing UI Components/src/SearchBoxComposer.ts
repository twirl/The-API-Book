import { ISearchResult } from './interfaces/ICoffeeApi';
import {
    ISearchBox,
    ISearchBoxOfferListChangeEvent,
    ISearchBoxOptions
} from './interfaces/ISearchBox';
import {
    IOfferFullView,
    IOfferPreview,
    ISearchBoxComposer,
    ISearchBoxComposerEvents
} from './interfaces/ISearchBoxComposer';
import {
    IOfferListComponent,
    IOfferListComponentOptions,
    IOfferSelectedEvent
} from './interfaces/IOfferListComponent';
import {
    IOfferPanelActionEvent,
    IOfferPanelComponent,
    IOfferPanelComponentOptions
} from './interfaces/IOfferPanelComponent';
import { IDisposer, IEventEmitter } from './interfaces/common';

import { OfferListComponent } from './OfferListComponent';
import { OfferPanelComponent } from './OfferPanelComponent';
import { EventEmitter } from './util/EventEmitter';

export class SearchBoxComposer implements ISearchBoxComposer {
    public events: IEventEmitter<ISearchBoxComposerEvents> =
        new EventEmitter<ISearchBoxComposerEvents>();

    protected offerListContainer: HTMLElement | null = null;
    protected offerListComponent: IOfferListComponent | null = null;
    protected offerPanelContainer: HTMLElement | null = null;
    protected offerPanelComponent: IOfferPanelComponent | null = null;
    protected offerList: ISearchResult[] | null;
    protected currentOffer: ISearchResult | null;

    protected listenerDisposers: IDisposer[];

    constructor(
        protected readonly context: ISearchBox,
        protected readonly container: HTMLElement,
        protected readonly contextOptions: ISearchBoxOptions
    ) {
        this.offerListContainer = document.createElement('div');
        container.appendChild(this.offerListContainer);
        this.offerListComponent = this.buildOfferListComponent();
        this.offerPanelContainer = document.createElement('div');
        container.appendChild(this.offerPanelContainer);
        this.offerPanelComponent = this.buildOfferPanelComponent();

        this.listenerDisposers = [
            context.events.on('offerListChange', this.onContextOfferListChange),
            this.offerListComponent.events.on(
                'offerSelect',
                this.onOfferListOfferSelect
            ),
            this.offerPanelComponent.events.on(
                'action',
                this.onOfferPanelAction
            )
        ];
    }

    public destroy() {
        for (const disposer of this.listenerDisposers) {
            disposer.off();
        }
        this.listenerDisposers = [];

        this.offerListComponent.destroy();
        this.offerPanelComponent.destroy();

        this.offerListContainer.parentNode.removeChild(this.offerListContainer);
        this.offerPanelContainer.parentNode.removeChild(
            this.offerPanelContainer
        );
    }

    protected onContextOfferListChange = ({
        offerList
    }: ISearchBoxOfferListChangeEvent) => {
        if (this.currentOffer !== null) {
            this.currentOffer = null;
            this.events.emit('offerFullViewToggle', { offer: null });
        }

        this.offerList = offerList;
        this.events.emit('offerPreviewListChange', {
            offerList: this.buildOfferPreviews()
        });
    };

    protected onOfferPanelAction({ action, offerId }: IOfferPanelActionEvent) {
        switch (action) {
            case 'createOrder':
                const offer = this.findOfferById(offerId);
                // Offer may be missing if `OfferPanelComponent`
                // renders offers asynchronously
                if (offer !== null) {
                    this.events.emit('createOrder', { offer });
                }
                break;
            case 'close':
                if (this.currentOffer !== null) {
                    this.currentOffer = null;
                    this.events.emit('offerFullViewToggle', { offer: null });
                }
                break;
        }
    }

    protected onOfferListOfferSelect({ offerId }: IOfferSelectedEvent) {
        const offer = this.findOfferById(offerId);
        // Offer may be missing for a variety of reasons,
        // most notably of `OfferListComponent` renders
        // offers asynchronously
        if (offer !== null) {
            this.currentOffer = offer;
            this.events.emit('offerFullViewToggle', {
                offer: this.generateCurrentOfferFullView()
            });
        } else {
            // TDB
        }
    }

    private findOfferById(offerIdToFind: string): ISearchResult | null {
        // Theoretically, we could have built a `Map`
        // for quickly searching offers by their id
        // Practically, as all responses in an API must be
        // paginated, it makes little sense to optimize this.
        return (
            this.offerList?.find(({ offerId }) => offerId === offerIdToFind) ??
            null
        );
    }

    protected buildOfferListComponent() {
        return new OfferListComponent(
            this,
            this.offerListContainer,
            this.buildOfferPreviews(),
            this.generateOfferListComponentOptions()
        );
    }

    protected buildOfferPreviews(): IOfferPreview[] | null {
        return this.offerList === null
            ? null
            : this.offerList.map((offer) => ({
                  offerId: offer.offerId,
                  title: offer.place.title,
                  subtitle: offer.recipe.title,
                  price: offer.price,
                  bottomLine: this.generateOfferBottomLine(offer)
              }));
    }

    protected generateOfferListComponentOptions(): IOfferListComponentOptions {
        return {};
    }

    protected buildOfferPanelComponent() {
        return new OfferPanelComponent(
            this,
            this.offerPanelContainer,
            this.generateCurrentOfferFullView(),
            this.buildOfferPanelComponentOptions()
        );
    }

    protected generateCurrentOfferFullView(): IOfferFullView | null {
        const offer = this.currentOffer;
        return offer === null
            ? null
            : {
                  offerId: offer.offerId,
                  title: offer.place.title,
                  description: [
                      offer.recipe.mediumDescription,
                      this.generateOfferBottomLine(offer)
                  ],
                  price: offer.price
              };
    }

    protected buildOfferPanelComponentOptions(): IOfferPanelComponentOptions {
        return {};
    }

    protected generateOfferBottomLine(offer: ISearchResult): string {
        return `${offer.place.walkTime.formattedValue} · ${offer.place.walkingDistance.formattedValue}`;
    }
}

export type OfferListComponentBuilder = (
    context: ISearchBoxComposer,
    container: HTMLElement,
    offerList: IOfferPreview[] | null,
    options: IOfferListComponentOptions
) => IOfferListComponent;

export type OfferPanelComponentBuilder = (
    context: ISearchBoxComposer,
    container: HTMLElement,
    offer: IOfferFullView | null,
    options: IOfferPanelComponentOptions
) => IOfferPanelComponent;
