class CustomSearchBox extends ourCoffeeSdk.SearchBox {
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
