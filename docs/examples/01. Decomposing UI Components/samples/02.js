const buildCustomOrderButton = function (
  offer,
  container
) {
  return ourCoffeeSdk.OfferPanelComponent.buildCreateOrderButton(
    offer,
    container,
    {
      createOrderButtonUrl:
        offer && offer.createOrderButtonIcon,
      createOrderButtonText:
        (offer &&
          `Buy now for just ${offer.price.formattedValue}`) ||
        "Place an Order",
    }
  );
};

class CustomComposer extends ourCoffeeSdk.SearchBoxComposer {
  generateOfferPreviews(offerList) {
    const result = super.generateOfferPreviews(
      offerList
    );
    return result === null
      ? result
      : result.map((preview, index) => ({
          ...preview,
          imageUrl: offerList[index].place.icon,
        }));
  }

  generateCurrentOfferFullView(offer, options) {
    return offer === null
      ? offer
      : {
          ...super.generateCurrentOfferFullView(
            offer,
            options
          ),
          createOrderButtonIcon: offer.place.icon,
        };
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
  ourCoffeeSdk.dummyCoffeeApi,
  {
    offerPanel: {
      buttonBuilders: [
        buildCustomOrderButton,
        ourCoffeeSdk.OfferPanelComponent
          .buildCloseButton,
      ],
    },
  }
);
searchBox.search("Lungo");
