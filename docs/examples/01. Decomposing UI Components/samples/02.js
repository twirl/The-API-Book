/**
 * @fileoverview
 * In this example, we change the composition logic:
 * there is no “offer full view” (panel) component, only
 * a offer list with additional actions
 */
const {
  SearchBox,
  SearchBoxComposer,
  OfferListComponent,
  dummyCoffeeApi,
  util
} = ourCoffeeSdk;

/**
 * A customized version of the standard `OfferListComponent`.
 * As we're okay with its logic, we reuse it with two modifications:
 *   * List items could be expanded (and then collapsed back)
 *   * List items contain the 'Place an order' button
 */
class CustomOfferList extends OfferListComponent {
  constructor(context, container, offerList, options) {
    super(context, container, offerList, options);
    /**
     * This is a custom DOM event listener to make
     * other than selecting an offer actions on the item
     * click event. This is the shortcut we took (see
     * the explanations in the `OfferPanelComponent.ts`
     * file).
     */
    this.onClickListener = (e) => {
      const { target, value: action } = util.findDataField(
        e.target,
        "action"
      );
      if (target === null || action === null) {
        return;
      }
      const { target: container, value: offerId } =
        util.findDataField(target, "offerId");
      if (container === null || offerId === null) {
        return;
      }
      switch (action) {
        case "expand":
          this.expand(container);
          break;
        case "collapse":
          this.collapse(container);
          break;
        case "createOrder":
          this.events.emit("createOrder", { offerId });
          break;
      }
    };
  }

  expand(item) {
    item.classList.add("expanded");
  }

  collapse(item) {
    item.classList.remove("expanded");
  }

  /**
   * This is a redefined function that returns
   * the offer “preview” markup in the list
   */
  generateOfferHtml(offer) {
    return util.html`<li
      class="custom-offer"
      data-offer-id="${util.attrValue(offer.offerId)}"
    >
      <button data-action="expand" class="preview"><aside class="expand-action">&gt;</aside><strong>${
        offer.title
      }</strong> · ${offer.price.formattedValue}</button>
      <div class="fullview">
        <button data-action="collapse" class="collapse-action">∧</button>
        <div><strong>${offer.title}</strong> · ${
      offer.price.formattedValue
    }</div>
        <div>${offer.subtitle}</div>
        <div>${offer.bottomLine}</div>
        <button data-action="createOrder" class="action-button">Place an Order</button>
      </div>
    </li>`.toString();
  }
}

/**
 * This is a custom implementation of the
 * `ISearchBoxComposer` interface from scratch.
 * As there is no offer panel in this particular
 * UI, we don't need all the associated logic,
 * so we replace the standard implementation
 * with this new one. However, we re-use the
 * implementation of the offer list subcomponent
 */
class CustomComposer {
  constructor(searchBox, container) {
    this.events = new util.EventEmitter();
    this.offerList = null;
    this.container = container;
    // This is our enhanced offer list
    this.offerList = new CustomOfferList(
      this,
      container,
      this.offerList
    );
    this.eventDisposers = [
      searchBox.events.on(
        "offerListChange",
        ({ offerList }) => this.onOfferListChange(offerList)
      ),
      // What we need is to listen to an additional event
      // the custom offer list emits, and convert it into
      // the order creation request
      this.offerList.events.on(
        "createOrder",
        ({ offerId }) => {
          const offer = this.findOfferById(offerId);
          if (offer) {
            this.events.emit("createOrder", {
              offer
            });
          }
        }
      )
    ];
  }
  /**
   * This is the `ISearchBoxComposer` interface
   * method we must implement
   */
  findOfferById(refOfferId) {
    return this.offerList
      ? this.offerList.find(
          ({ offerId }) => offerId == refOfferId
        )
      : null;
  }
  /**
   * This is the `ISearchBoxComposer` interface
   * method we must implement
   */
  destroy() {
    for (const disposer of this.eventDisposers) {
      disposer.off();
    }
    this.offerList.destroy();
  }
  onOfferListChange(offerList) {
    this.offerList = offerList;
    this.events.emit("offerPreviewListChange", {
      // This is our custom offer preview generator
      // function. As we don't plan to customize
      // it further, we don't bother with exposing
      // overridable methods, etc.
      offerList:
        offerList !== null
          ? offerList.map((offer) => ({
              offerId: offer.offerId,
              title: offer.place.title,
              subtitle: offer.description,
              bottomLine:
                SearchBoxComposer.generateOfferBottomLine(
                  offer
                ),
              price: offer.price
            }))
          : null
    });
  }
}

/**
 * We're subclassing `SearchBox` to use our
 * custom composer
 */
class CustomSearchBox extends SearchBox {
  buildComposer(context, container, options) {
    return new CustomComposer(context, container, options);
  }

  createOrder(offer) {
    alert(`Isn't actually implemented (yet)`);
    return super.createOrder(offer);
  }
}

const searchBox = new CustomSearchBox(
  document.getElementById("search-box"),
  dummyCoffeeApi
);
searchBox.search("Lungo");
