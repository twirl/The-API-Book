const {
  SearchBox,
  SearchBoxComposer,
  DummyMapApi,
  dummyCoffeeApi,
  util
} = ourCoffeeSdk;

class CustomOfferList {
  constructor(context, container, offerList) {
    this.context = context;
    this.container = container;
    this.events = new util.EventEmitter();
    this.offerList = null;
    this.map = null;

    this.onMarkerClick = (markerId) => {
      this.events.emit("offerSelect", {
        offerId: markerId
      });
    };
    this.setOfferList = ({ offerList: newOfferList }) => {
      if (this.map) {
        this.map.destroy();
        this.map = null;
      }
      this.offerList = newOfferList;
      if (newOfferList) {
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

  destroy() {
    if (this.map) {
      this.map.destroy();
    }
    for (const listener of this.contextListeners) {
      listener.off();
    }
  }
}

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
