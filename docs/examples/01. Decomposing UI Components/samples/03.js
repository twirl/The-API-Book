const {
  SearchBox,
  SearchBoxComposer,
  OfferPanelComponent,
  OfferPanelButton,
  util,
  dummyCoffeeApi
} = ourCoffeeSdk;

const { buildCreateOrderButton, buildCloseButton } =
  OfferPanelComponent;

const buildCustomOrderButton = function (offer, container) {
  return OfferPanelComponent.buildCreateOrderButton(
    offer,
    container,
    {
      createOrderButtonUrl:
        offer && offer.createOrderButtonIcon,
      createOrderButtonText:
        (offer &&
          `Buy now for just ${offer.price.formattedValue}`) ||
        "Place an Order"
    }
  );
};

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

const buildPreviousOfferButton = function (
  offer,
  container
) {
  return new NavigateButton(
    "left",
    offer.previousOfferId,
    container
  );
};

const buildNextOfferButton = function (offer, container) {
  return new NavigateButton(
    "right",
    offer.nextOfferId,
    container
  );
};

class NavigateButton {
  constructor(direction, offerId, container) {
    this.action = "navigate";
    this.offerId = offerId;
    this.events = new util.EventEmitter();
    const button = (this.button =
      document.createElement("button"));
    button.innerHTML = direction === "left" ? "⟨" : "⟩";
    button.className = direction;
    container.classList.add("custom-control");
    this.container = container;
    this.listener = () =>
      this.events.emit("press", {
        target: this
      });
    button.addEventListener("click", this.listener);
    container.appendChild(button);
  }

  destroy() {
    this.button.removeEventListener("click", this.listener);
    this.button.parentElement.removeChild(this.button);
    this.container.classList.remove("custom-control");
  }
}

class CustomOfferPanel extends OfferPanelComponent {
  show() {
    const buttons = [];
    const offer = this.currentOffer;
    if (offer.previousOfferId) {
      buttons.push(buildPreviousOfferButton);
    }
    buttons.push(buildCreateOrderButton);
    if (offer.phone) {
      buttons.push(buildCallButton);
    }
    buttons.push(buildCloseButton);
    if (offer.nextOfferId) {
      buttons.push(buildNextOfferButton);
    }
    this.options.buttonBuilders = buttons;
    super.show();
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
      {
        ...CustomComposer.DEFAULT_OPTIONS,
        ...this.generateOfferPanelComponentOptions(
          contextOptions
        )
      }
    );
  }

  generateOfferPreviews(offerList) {
    const result = super.generateOfferPreviews(offerList);
    return result === null
      ? result
      : result.map((preview, index) => ({
          ...preview,
          imageUrl: offerList[index].place.icon
        }));
  }

  generateCurrentOfferFullView(offer, options) {
    const offerFullView =
      super.generateCurrentOfferFullView(offer, options);
    if (offer) {
      if (offer.place.phone) {
        offerFullView.phone = offer.place.phone;
      }
      if (offer.place.icon) {
        offerFullView.createOrderButtonIcon =
          offer.place.icon;
      }
      if (this.offerList) {
        const offers = this.offerList;
        const index = offers.findIndex(
          ({ offerId }) => offerId === offer.offerId
        );
        if (index > 0) {
          offerFullView.previousOfferId =
            offers[index - 1].offerId;
        }
        if (index < offers.length - 1 && index >= 0) {
          offerFullView.nextOfferId =
            offers[index + 1].offerId;
        }
      }
    }
    return offerFullView;
  }

  performAction(event) {
    if (event.action === "navigate") {
      this.selectOffer(event.target.offerId);
    } else {
      super.performAction(event);
    }
  }
}

CustomComposer.DEFAULT_OPTIONS = {
  createOrderButtonText: "🛒Place an Order",
  callButtonText: "☎️ Make a Call",
  closeButtonText: "❌Not Now"
};

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
