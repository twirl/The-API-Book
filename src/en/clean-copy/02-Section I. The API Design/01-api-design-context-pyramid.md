### The API Contexts Pyramid

The approach we use to design APIs comprises four steps:

* Defining an application field

* Separating abstraction levels

* Isolating responsibility areas

* Describing final interfaces.

This four-step algorithm actually builds an API from top to bottom, from common requirements and use case scenarios down to a refined nomenclature of entities. In fact, moving this way will eventually conclude with a ready-to-use API, and that's why we value this approach highly.

It might seem that the most useful pieces of advice are given in the last chapter, but that's not true. The cost of a mistake made at certain levels differs. Fixing the naming is simple; revising the wrong understanding of what the API stands for is practically impossible.

Here and throughout we will illustrate the API design concepts using a hypothetical example of an API that allows ordering a cup of coffee in city cafes. Just in case: this example is totally synthetic. If we were to design such an API in the real world, it would probably have very little in common with our fictional example.

**NB**. A knowledgeable reader might notice that the approach we discuss is quite similar to the concept of “Levels of Design” proposed by Steve McConnell in his definitive book.[ref:mcconnell-code-complete 5.2 Key Design Concepts]() This is both true and not true at the same time. On one hand, as APIs are software, all the classical architecture design patterns work for them, including those described by McConnell. On the other hand, there is a major difference between exposing APIs and working on shared code: you only provide *the contract* to customers, as they are unable and/or unwilling to check the code itself. This shifts the focus significantly, starting from the very first McConnell's design level: while it is your number-one task to split the grand design into subsystems when you develop a software project as an architect, it is often undesirable to provide the notion of your subsystem split in the API, as API consumers do not need to know about it. In the following chapters, we will focus on providing a well-designed nomenclature of entities that is both convenient for external developers and allows for implementing efficient architecture under the hood.