const {
  SearchBox,
  SearchBoxComposer,
  OfferPanelComponent,
  OfferPanelButton,
  util,
  dummyCoffeeApi
} = ourCoffeeSdk;

const buildCallButton = function (
  offer,
  container,
  options
) {
  return new OfferPanelButton("call", container, {
    text: util.html`<a href="tel:${util.attrValue(
      offer.phone
    )}" style="color: inherit; text-decoration: none;">${
      options.callButtonText
    }</a>`
  });
};

const buildCreateOrderButton =
  OfferPanelComponent.buildCreateOrderButton;
const buildCloseButton =
  OfferPanelComponent.buildCloseButton;

class CustomOfferPanel extends OfferPanelComponent {
  show() {
    this.options.buttonBuilders = this
      .currentOffer.phone
      ? [
          buildCreateOrderButton,
          buildCallButton,
          buildCloseButton
        ]
      : [
          buildCreateOrderButton,
          buildCloseButton
        ];
    return super.show();
  }
}

class CustomComposer extends SearchBoxComposer {
  buildOfferPanelComponent(
    context,
    container,
    currentOffer,
    contextOptions
  ) {
    return new CustomOfferPanel(
      context,
      container,
      this.generateCurrentOfferFullView(
        currentOffer,
        contextOptions
      ),
      this.generateOfferPanelComponentOptions(
        contextOptions
      )
    );
  }

  generateCurrentOfferFullView(offer, options) {
    const offerFullView =
      super.generateCurrentOfferFullView(
        offer,
        options
      );
    if (offer && offer.place.phone) {
      offerFullView.phone = offer.place.phone;
    }
    return offerFullView;
  }
}

class CustomSearchBox extends SearchBox {
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
  dummyCoffeeApi,
  {
    offerPanel: {
      createOrderButtonText: "🛒Place an Order",
      callButtonText: "☎️ Make a Call",
      closeButtonText: "❌Not Now"
    }
  }
);
searchBox.search("Lungo");
