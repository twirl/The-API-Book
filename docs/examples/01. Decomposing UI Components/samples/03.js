/**
 * @fileoverview
 * In this example, we enhance the standard offer list with
 * icons of the coffee shops and the offer view panel,
 * with an additional business logic, exposing several additional
 * controls and customizing the existing ones
 */

const {
  SearchBox,
  SearchBoxComposer,
  OfferPanelComponent,
  OfferPanelButton,
  util,
  dummyCoffeeApi
} = ourCoffeeSdk;

const { buildCloseButton } = OfferPanelComponent;

/**
 * This is the factory method to create a customized
 * “Place an order” button that augments the button
 * look depending on the additional data fields
 * in the assiciated offer
 */
const buildCustomCreateOrderButton = function (
  offer,
  container
) {
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

/**
 * This is the factory method to create a customized
 * button that allows for making a phone call
 */
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

/**
 * This is the factory method to create a customized
 * button that allows for navigating back to the
 * previous offer
 */
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

/**
 * This is the factory method to create a customized
 * button that allows for navigating to the next offer
 */
const buildNextOfferButton = function (offer, container) {
  return new NavigateButton(
    "right",
    offer.nextOfferId,
    container
  );
};

/**
 * This is a new implementation of the `IButton` interface
 * from scratch. As “Back” and “Forward” buttons share little
 * logic with the standard button (they do not have
 * text or icon, feature a different design, etc.) it's
 * more convenient to make a new class.
 */
class NavigateButton {
  constructor(direction, targetOfferId, container) {
    this.action = "navigate";
    this.targetOfferId = targetOfferId;
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

/**
 * This is the customization of the standard `OfferPanelComponent`
 * class. In this custom implementation, the array of
 * buttons is contructed dynamically depending on the data
 * shown in the pannel.
 *
 * This is a bit of a shortcut (we should have a separate
 * composer between a panel and its buttons). The full solution
 * is left as an exercise for the reader.
 */
class CustomOfferPanel extends OfferPanelComponent {
  show() {
    const buttons = [];
    const offer = this.currentOffer;
    if (offer.previousOfferId) {
      buttons.push(buildPreviousOfferButton);
    }
    buttons.push(buildCustomCreateOrderButton);
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

/**
 * To work with the augmented panel we need
 * an augmented composer:
 *   * Add the coffee chain icon to the
 *     “preview” data for the offer list
 *   * Use the enhanced offer panel instead
 *     of the standard one
 *   * Enrich the data for the panel needs
 *     with additional fields, such as
 *     the custom icon, phone, and the identifiers
 *     of the previous and next offers
 */
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
      // NB: `event` itself contains an `offerId`
      // However, this is the identifier of a currently
      // displayed offer. With `navigate` buttons
      // we need a different offer, the one we
      // need to navigate ro
      this.selectOffer(event.target.targetOfferId);
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
  dummyCoffeeApi
);
searchBox.search("Lungo");
