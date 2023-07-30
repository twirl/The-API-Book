class CustomOfferList extends ourCoffeeSdk.OfferListComponent {
  constructor(
    context,
    container,
    offerList,
    options
  ) {
    super(context, container, offerList, options);
    this.onOfferButtonClickListener = (e) => {
      const action = e.target.dataset.action;
      const offerId = e.target.dataset.offerId;
      if (action === "offerSelect") {
        this.events.emit(action, { offerId });
      } else if (action === "createOffer") {
        const offer =
          this.context.findOfferById(offerId);
        if (offer) {
          this.context.events.emit(
            "createOrder",
            {
              offer
            }
          );
        }
      }
    };
  }

  generateOfferHtml(offer) {
    return ourCoffeeSdk.util.html`<li
      class="custom-offer"
    >
      <div><strong>${offer.title}</strong></div>
      <div>${offer.subtitle}</div>
      <div>${offer.bottomLine} <button 
        data-offer-id="${ourCoffeeSdk.util.attrValue(
          offer.offerId
        )}"
        data-action="createOffer"
      >Buy now for ${
        offer.price.formattedValue
      }</button><button 
        data-offer-id="${ourCoffeeSdk.util.attrValue(
          offer.offerId
        )}"
          data-action="offerSelect"
      >View details</button>
      </div>
      <hr/>
    </li>`.toString();
  }

  setupDomListeners() {
    const buttons =
      this.container.querySelectorAll("button");
    for (const button of buttons) {
      button.addEventListener(
        "click",
        this.onOfferButtonClickListener
      );
    }
  }

  teardownDomListeners() {
    const buttons = document.querySelectorAll(
      this.container,
      "button"
    );
    for (const button of buttons) {
      button.removeEventListener(
        "click",
        this.onOfferButtonClickListener
      );
    }
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
