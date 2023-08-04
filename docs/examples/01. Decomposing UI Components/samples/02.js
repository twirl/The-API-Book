const {
  SearchBox,
  SearchBoxComposer,
  OfferListComponent,
  dummyCoffeeApi,
  util
} = ourCoffeeSdk;

class CustomOfferList extends OfferListComponent {
  constructor(context, container, offerList, options) {
    super(context, container, offerList, options);

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
          this.context.createOrder(offerId);
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
  dummyCoffeeApi
);
searchBox.search("Lungo");
