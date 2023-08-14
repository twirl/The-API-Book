/**
 * @fileoverview
 * In this example, we replace the standard offer list
 * with an alternative implementation that shows offers
 * as markers on a map
 */
const {
  SearchBox,
  SearchBoxComposer,
  DummyMapApi,
  dummyCoffeeApi,
  util
} = ourCoffeeSdk;

/**
 * A custom offer list component that
 * renders data on the map instead of a static
 * list. This class implements the `IOfferListComponent`
 * interface from scratch.
 */
class CustomOfferList {
  constructor(context, container, offerList) {
    this.context = context;
    this.container = container;
    this.events = new util.EventEmitter();
    this.offerList = null;
    this.map = null;

    /**
     * We listen to the map events (marker selection)
     * and translate it as an offer selection event.
     * This is the requirement from the `IOfferListComponent`
     * interface
     */
    this.onMarkerClick = (markerId) => {
      this.events.emit("offerSelect", {
        offerId: markerId
      });
    };
    /**
     * We are free to implement the business logic in
     * any that suits our needs
     */
    this.setOfferList = ({ offerList: newOfferList }) => {
      if (this.map) {
        this.map.destroy();
        this.map = null;
      }
      this.offerList = newOfferList;
      if (newOfferList) {
        // We're displaying data on a map (a dummy one),
        // using the additional data we pass through the
        // customized composer (see below)
        this.map = new DummyMapApi(this.container, [
          [16.355, 48.2],
          [16.375, 48.214]
        ]);
        for (const offer of newOfferList) {
          this.map.addMarker(
            offer.offerId,
            offer.location,
            this.onMarkerClick
          );
        }
      }
    };

    this.setOfferList({ offerList });
    this.contextListeners = [
      context.events.on(
        "offerPreviewListChange",
        this.setOfferList
      ),
      // We listen to the
      // 'offerFullViewToggle' event on
      // the parent composer context
      // to select or deselect the corresponding
      // marker.
      //
      // Note the important pattern:
      // when the marker is clicked, we DO NOT
      // mark it as selected, but only emit an
      // event. This is because the offer list
      // does not own the logic of selecting
      // offers.
      // It is the composer's responsibility
      // to decide, whether this event should
      // result in opening a panel or not
      context.events.on(
        "offerFullViewToggle",
        ({ offer }) => {
          this.map.selectSingleMarker(
            offer && offer.offerId
          );
        }
      )
    ];
  }

  /**
   * As required in the `IOfferListComponent` interface
   */
  destroy() {
    if (this.map) {
      this.map.destroy();
    }
    for (const listener of this.contextListeners) {
      listener.off();
    }
  }
}

/**
 * We need to subclass a standard `SearchBoxComposer`
 * to achieve to important goals:
 *   * Use the custom offer list we created instead
 *     of the standard component
 *   * Enrich the preview data with the geographical
 *     coordinates of the coffee shop
 */
class CustomComposer extends SearchBoxComposer {
  buildOfferListComponent(
    context,
    container,
    offerList,
    contextOptions
  ) {
    return new CustomOfferList(
      context,
      container,
      this.generateOfferPreviews(offerList, contextOptions),
      this.generateOfferListComponentOptions(contextOptions)
    );
  }

  generateOfferPreviews(offerList) {
    const result = super.generateOfferPreviews(offerList);
    return result === null
      ? result
      : result.map((preview, index) => ({
          ...preview,
          location: offerList[index].place.location
        }));
  }
}

/**
 * We're subclassing `SearchBox` to use our
 * enhanced composer
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
  dummyCoffeeApi,
  {
    offerPanel: {
      transparent: true
    }
  }
);
searchBox.search("Lungo");
