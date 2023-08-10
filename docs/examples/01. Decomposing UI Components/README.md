# Decomposing UI Components

This is the example illustrating complexities of decomposing a UI component into a series of subcomponents that would simultaneously allow to:
  * Redefining the appearance of each of the subcomponent
  * Introducing new business logic while keeping styling consistent
  * Inheriting the UX of the component while changing both UI and business logic.

The `src` folder contains a TypeScript code for the component and corresponding interfaces, and the `index.js` file contains the compiled JavaScript (check `tsconfig.json` for compiler settings).

The `index.html` page includes a living example for each of the discussed scenarios, with links pointing to external playgrounds to work through the code if needed. [View it in your browser](https://twirl.github.io/examples/01.%20Decomposing%20UI%20Components/index.html).

The following improvements to the code are left as an exercise for the reader:
  * Make all builder functions configurable through options
  * Make `ISearchBoxComposer` a composition of two interfaces: one facade to interact with a `SearchBox`, and another facade to communicate with child components.
  * Create a separate composer to close the gap between `OfferPanelComponent` and its buttons
  * Add returning an operation status from the `SearchBox.search` method:
      ```
      public search(query: string): Promise<OperationResult>
      ```

      Where

      ```
      type OperationResult =
        | {
            status: OperationResultStatus.SUCCESS;
            results: ISearchResult[];
          }
        | { status: OperationResultStatus.INTERRUPTED }
        | {
            status: OperationResultStatus.FAIL;
            error: any;
        };

      export enum OperationResultStatus {
        SUCCESS = 'success',
        FAIL = 'fail',
        INTERRUPTED = 'interrupted'
      }
      ```

  * Make an offer list paginated (implying adding pagination parameters to `ICoffeeApi.search` request and response, and dynamically loading new items while scrolling the offer list)

  * Make the input string and the search button a separate `ISeachBoxInput` component. Add an ability to cancel the ongoing request. Add a “skeleton” animation to indicate that search results are being loading.

  * Localize the component, making a locale and a dictionary a part of the `ISearchBox` options.

  * Parametrize `context` parameter for `OfferListComponent` and `OfferPanelComponent`. Make it comprise only events needed by the component, so that `ISearchBoxComposer` would be implementing `IOfferListComponentContext` and `IOfferPanelComponentContext` interfaces.

  * Make `options` mutable (expose an `optionChange` event and implement `Composers`'s reaction to relevant option changes).

  * Parametrize all extra options, content fields, actions and events.

  * Parametrize markups of components, either by:
      * Incapsulating them in some `Layout` entities controlled through options. Create interfaces for each of the layouts. Create a `VisualComponent` base class for entities that have a layout and inherit `SearchBox`, `OfferListComponent` and `OfferPanelComponent` from it, or
      * Rewriting components as React / ReactNative / SwiftUI / Android View component or as a UI component for any other platform of your choice.
