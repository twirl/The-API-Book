# Decomposing UI Components

This example illustrates the complexities of decomposing a UI component into a series of subcomponents that would simultaneously allow:
  * Redefining the appearance of each of the subcomponents.
  * Introducing new business logic while keeping styling consistent.
  * Inheriting the UX of the component while changing both UI and business logic.

The `src` folder contains TypeScript code for the component and corresponding interfaces, while the `index.js` file contains the compiled JavaScript (please refer to `tsconfig.json` for compiler settings).

The `index.html` page includes a live example for each of the discussed scenarios, with a live code playgrounds for further code exploration. Feel free to view it in your browser.

The following improvements to the code are left as an exercise for the reader:
  1. Make all builder functions configurable through the `SearchBox` options (instead of subclassing components and overriding builder functions)
  2. Make a better abstraction of the `SearchBoxComposer` internal state. Make the `findOfferById` function asynchronous
  3. Make rendering functions asynchronous
  4. Refactor `ISearchBoxComposer` as a composition of two interfaces: one facade for interacting with a `SearchBox`, and another for communication with child components.
  5. Create a separate composer to bridge the gap between `OfferPanelComponent` and its buttons.
  6. Enhance the `SearchBox.search` method to return an operation status:

      ```typescript
      public search(query: string): Promise<OperationResult>
      ```

      Where OperationResult is defined as:

      ```typescript
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
      ```

      With the enum:

      ```typescript
      export enum OperationResultStatus {
        SUCCESS = 'success',
        FAIL = 'fail',
        INTERRUPTED = 'interrupted'
      }
      ```

  7. Implement pagination for the offer list (add pagination parameters to `ICoffeeApi.search` request and response, and load new items dynamically while scrolling the offer list).
  8. Create a separate `ISeachBoxInput` component for the input string and the search button. Add the ability to cancel ongoing requests and include a "skeleton" animation to indicate that search results are loading.
  9. Localize the component by making locale and a dictionary part of the `ISearchBox` options.
  10. Make options mutable by exposing an `optionChange` event and implementing the `Composer`'s reaction to relevant option changes.
  11. Parameterize all extra options, content fields, actions, and events.
  12. Parametrize the markups of components either by:

      * Encapsulating them in Layout entities controlled through options. Create interfaces for each layout and a VisualComponent base class for entities with layouts. Inherit SearchBox, OfferListComponent, and OfferPanelComponent from this base class.

      * Rewriting components as React / ReactNative / SwiftUI / Android View components or as UI components for other platforms of your choice.