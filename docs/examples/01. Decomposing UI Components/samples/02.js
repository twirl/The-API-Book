class CustomOfferList {
  constructor(context, container, offerList) {
    this.context = context;
    this.container = container;
    this.events =
      new ourCoffeeSdk.util.EventEmitter();
    this.offerList = null;
    this.map = null;

    this.onMarkerSelect = (markerId) => {
      this.events.emit("offerSelect", {
        offerId: markerId
      });
    };
    this.setOfferList = ({
      offerList: newOfferList
    }) => {
      if (this.map) {
        this.map.destroy();
        this.map = null;
      }
      this.offerList = newOfferList;
      if (newOfferList) {
        this.map = new ourCoffeeSdk.DummyMapApi(
          this.container,
          [
            [16.355, 48.206],
            [16.375, 48.214]
          ]
        );
        for (const offer of newOfferList) {
          this.map.addMarker(
            offer.offerId,
            offer.location,
            this.onMarkerSelect
          );
        }
      }
    };

    this.setOfferList({ offerList });
    this.contextListener = context.events.on(
      "offerPreviewListChange",
      this.setOfferList
    );
  }

  destroy() {
    if (this.map) {
      this.map.destroy();
    }
    this.contextListener.off();
  }
}

class CustomComposer extends ourCoffeeSdk.SearchBoxComposer {
  buildOfferListComponent(
    context,
    container,
    offerList,
    contextOptions
  ) {
    return new CustomOfferList(
      context,
      container,
      this.generateOfferPreviews(
        offerList,
        contextOptions
      ),
      this.generateOfferListComponentOptions(
        contextOptions
      )
    );
  }

  generateOfferPreviews(offerList) {
    const result = super.generateOfferPreviews(
      offerList
    );
    return result === null
      ? result
      : result.map((preview, index) => ({
          ...preview,
          location:
            offerList[index].place.location
        }));
  }
}

class CustomSearchBox extends ourCoffeeSdk.SearchBox {
  buildComposer(context, container, options) {
    return new CustomComposer(
      context,
      container,
      options
    );
  }

  createOrder(offer) {
    alert(`Isn't actually implemented (yet)`);
    return super.createOrder(offer);
  }
}

const searchBox = new CustomSearchBox(
  document.getElementById("search-box"),
  ourCoffeeSdk.dummyCoffeeApi
);
searchBox.search("Lungo");
