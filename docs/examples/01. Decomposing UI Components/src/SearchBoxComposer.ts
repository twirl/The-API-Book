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
import { IDisposer, IEventEmitter, IExtraFields } from './interfaces/common';

import { OfferListComponent } from './OfferListComponent';
import { OfferPanelComponent } from './OfferPanelComponent';
import { EventEmitter } from './util/EventEmitter';

export class SearchBoxComposer<ExtraOptions extends IExtraFields = {}>
    implements ISearchBoxComposer
{
    public events: IEventEmitter<ISearchBoxComposerEvents> =
        new EventEmitter<ISearchBoxComposerEvents>();

    protected offerListContainer: HTMLElement | null = null;
    protected offerListComponent: IOfferListComponent | null = null;
    protected offerPanelContainer: HTMLElement | null = null;
    protected offerPanelComponent: IOfferPanelComponent | null = null;
    protected offerList: ISearchResult[] | null = null;
    protected currentOffer: ISearchResult | null = null;

    protected listenerDisposers: IDisposer[];

    constructor(
        protected readonly context: ISearchBox,
        protected readonly container: HTMLElement,
        protected readonly contextOptions: ISearchBoxOptions & ExtraOptions
    ) {
        this.offerListContainer = document.createElement('div');
        container.appendChild(this.offerListContainer);
        this.offerListComponent = this.buildOfferListComponent(
            this,
            this.offerListContainer,
            this.offerList,
            this.contextOptions
        );
        this.offerPanelContainer = document.createElement('div');
        container.appendChild(this.offerPanelContainer);
        this.offerPanelComponent = this.buildOfferPanelComponent(
            this,
            this.offerPanelContainer,
            this.currentOffer,
            this.contextOptions
        );

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

    public findOfferById(offerIdToFind: string): ISearchResult | null {
        // Theoretically, we could have built a `Map`
        // for quickly searching offers by their id
        // Practically, as all responses in an API must be
        // paginated, it makes little sense to optimize this prematurely.
        return (
            this.offerList?.find(({ offerId }) => offerId === offerIdToFind) ??
            null
        );
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
            offerList: this.generateOfferPreviews(
                this.offerList,
                this.contextOptions
            )
        });
    };

    protected onOfferPanelAction = ({
        action,
        offerId
    }: IOfferPanelActionEvent) => {
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
    };

    protected onOfferListOfferSelect = ({ offerId }: IOfferSelectedEvent) => {
        const offer = this.findOfferById(offerId);
        // Offer may be missing for a variety of reasons,
        // most notably of `OfferListComponent` renders
        // offers asynchronously
        if (offer !== null) {
            this.currentOffer = offer;
            this.events.emit('offerFullViewToggle', {
                offer: this.generateCurrentOfferFullView(
                    this.currentOffer,
                    this.contextOptions
                )
            });
        } else {
            // TDB
        }
    };

    protected buildOfferListComponent(
        context: ISearchBoxComposer,
        container: HTMLElement,
        offerList: ISearchResult[] | null,
        contextOptions: ISearchBoxOptions & ExtraOptions
    ): IOfferListComponent {
        return new OfferListComponent(
            context,
            container,
            this.generateOfferPreviews(offerList, contextOptions),
            this.generateOfferListComponentOptions(contextOptions)
        );
    }

    protected generateOfferPreviews(
        offerList: ISearchResult[] | null,
        contextOptions: ISearchBoxOptions & ExtraOptions
    ): IOfferPreview[] | null {
        return offerList === null
            ? null
            : offerList.map((offer) => ({
                  offerId: offer.offerId,
                  title: offer.place.title,
                  subtitle: offer.recipe.shortDescription,
                  price: offer.price,
                  bottomLine: this.generateOfferBottomLine(offer)
              }));
    }

    protected generateOfferListComponentOptions(
        options: ISearchBoxOptions
    ): IOfferListComponentOptions {
        return {};
    }

    protected buildOfferPanelComponent(
        context: ISearchBoxComposer,
        container: HTMLElement,
        currentOffer: ISearchResult | null,
        contextOptions: ISearchBoxOptions & ExtraOptions
    ): IOfferPanelComponent {
        return new OfferPanelComponent(
            context,
            container,
            this.generateCurrentOfferFullView(currentOffer, contextOptions),
            this.generateOfferPanelComponentOptions(contextOptions)
        );
    }

    protected generateCurrentOfferFullView(
        offer: ISearchResult | null,
        contextOptions: ISearchBoxOptions & ExtraOptions
    ): IOfferFullView | null {
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

    protected generateOfferPanelComponentOptions(
        options: ISearchBoxOptions & ExtraOptions
    ): IOfferPanelComponentOptions {
        return options.offerPanel ?? {};
    }

    protected generateOfferBottomLine(offer: ISearchResult): string {
        return offer.place.walkingDistance.numericValueMeters >= 100
            ? `${offer.place.walkTime.formattedValue} · ${offer.place.walkingDistance.formattedValue}`
            : 'Just around the corner';
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
