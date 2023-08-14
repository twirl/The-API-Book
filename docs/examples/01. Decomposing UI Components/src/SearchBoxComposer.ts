/**
 * @fileoverview
 * This file comprises a reference implementation
 * of the `ISearchBoxComposer` interface called simply `SearchBoxComposer`
 */

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

/**
 * A `SearchBoxComposer` stands for an entity which
 * controls the data flow between an abstract `ISearchBox`
 * and a specific UI concept.
 *
 * This reference implementation assumes that each offer
 * might be represented as a list item (a 'preview') and
 * as a detailed representation (a `full view`).
 *
 * The responsibility of the composer is:
 *   * Instantiating and destroying nested components
 *     that handles previews (`IOfferListComponent`) and
 *     a full view (`IOfferPanelComponent`)
 *   * Handling an internal state (a list of offers and
 *     a currently selected offer) and emitting events when
 *     it changes
 *   * Generating previews, full views, and UI options when
 *     needed
 *   * Notifying parent `ISearchBox` about the user's intention
 *     to place an order
 */
export class SearchBoxComposer<ExtraOptions extends IExtraFields = {}>
    implements ISearchBoxComposer
{
    /**
     * An accessor to subscribe for events or emit them.
     */
    public events: IEventEmitter<ISearchBoxComposerEvents> =
        new EventEmitter<ISearchBoxComposerEvents>();

    /**
     * Instances of subcomponents and HTML element containers
     * to host them
     */
    protected offerListContainer: HTMLElement | null = null;
    protected offerListComponent: IOfferListComponent | null = null;
    protected offerPanelContainer: HTMLElement | null = null;
    protected offerPanelComponent: IOfferPanelComponent | null = null;
    /**
     * A current state of the composer itself
     */
    protected offerList: ISearchResult[] | null = null;
    protected currentOffer: ISearchResult | null = null;

    /**
     * Event listeners
     */
    private onOfferPanelAction = (event: IOfferPanelActionEvent) => {
        this.performAction(event);
    };
    private onOfferListOfferSelect = ({ offerId }: IOfferSelectedEvent) =>
        this.selectOffer(offerId);
    private listenerDisposers: IDisposer[];
    /**
     * A `SearchBoxComposer` synchoronously initializes itself
     * in the context of the given `SearchBox` with provided
     * options and HTML container element.
     */
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

    /**
     * Allows for searching for a displayed offer
     */
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

    /**
     * Exposed publicly to allow developers to programmatically
     * select an offer (which typically implies opening an offer panel)
     */
    public selectOffer(offerId: string) {
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
    }

    /**
     * Exposed publicly to allow programmatically
     * performing actions the composer is capable of,
     * i.e., creating an order or closing the offer panel,
     * or to add new actions in subclasses
     */
    public performAction({
        action,
        currentOfferId: offerId
    }: IOfferPanelActionEvent) {
        switch (action) {
            case 'createOrder':
                this.createOrder(offerId);
                break;
            case 'close':
                if (this.currentOffer !== null) {
                    this.currentOffer = null;
                    this.events.emit('offerFullViewToggle', { offer: null });
                }
                break;
        }
    }

    /**
     * Exposed publicly as a helper function
     */
    public createOrder(offerId: string) {
        const offer = this.findOfferById(offerId);
        // Offer may be missing if `OfferPanelComponent`
        // renders offers asynchronously
        if (offer !== null) {
            this.events.emit('createOrder', { offer });
        }
    }

    /**
     * Destroys the composer and all its subcomponents
     */
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

    /**
     * The event subscriber for the parent context `offerListChange`
     * event. Transforms the high-level event into a couple of lover-level
     * ones and maintaints the composer's internal state.
     * Exposed as a protected method to allow custom reactions
     * to parent context state change in subclasses.
     */
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

    /**
     * A factory method to build an instance of an offer list
     * sub-component. Exposed as a protected method to allow
     * custom implementations of an offer list in subclasses
     */
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

    /**
     * A helper to generate “preview” data for the offer list component.
     * Exposed as a protected method to allow enriching preview data
     * with custom fields in subclasses.
     */
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
                  bottomLine: SearchBoxComposer.generateOfferBottomLine(offer)
              }));
    }

    /**
     * A helper to translate context options (i.e., the options of the
     * parent `ISearchBox`) into the options of the offer list subcomponent.
     * Exposed as a protected method to allow for an additional logic of
     * generating options or passing extra options in subclasses
     */
    protected generateOfferListComponentOptions(
        options: ISearchBoxOptions
    ): IOfferListComponentOptions {
        return {};
    }

    /**
     * A factory method to build an instance of an offer panel
     * sub-component. Exposed as a protected method to allow
     * custom implementations of an offer panel in subclasses
     */
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

    /**
     * A helper to generate “full view” data for the offer panel component.
     * Exposed as a protected method to allow enriching full view data
     * with custom fields in subclasses.
     */
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
                      SearchBoxComposer.generateOfferBottomLine(offer)
                  ],
                  price: offer.price
              };
    }

    /**
     * A helper to translate context options (i.e., the options of the
     * parent `ISearchBox`) into the options of the offer panel subcomponent.
     * Exposed as a protected method to allow for an additional logic of
     * generating options or passing extra options in subclasses
     */
    protected generateOfferPanelComponentOptions(
        options: ISearchBoxOptions & ExtraOptions
    ): IOfferPanelComponentOptions {
        return options.offerPanel ?? {};
    }

    /**
     * A small helper method to generate “bottomlines” for offers
     */
    public static generateOfferBottomLine(offer: ISearchResult): string {
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
