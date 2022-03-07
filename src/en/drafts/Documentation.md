Regretfully, many API providers pay miserable attention to the documentation quality. Meanwhile, the documentation is the face of the product and the entry point to it. The problem becomes even worse if we acknowledge that it's almost impossible to write the help docs the developers will consider being at least satisfactory.

Before we start describing documentation types and formats, we should stress one important statement: developers interact with your help materials totally unlike you expect them to. Remember yourself working on the project: you make quite specific actions.

  1. First, you need to determine whether this service covers your needs in general (as quickly as possible);
  2. If yes, you look for specific functionality to resolve your specific case.

In fact, newcomers (e.g. those developers who are not familiar with the API) usually want just one thing: to assemble the code that solves their problem out of existing code examples and never return to this issue again. Sounds not exactly reassuringly, given the amount of work invested into the API and its documentation development, but that's how the reality looks like. Also, that's the root cause of developers' dissatisfaction with the docs: it's literally impossible to have articles covering exactly that problem the developer comes with being detailed exactly to the extent the developer knows the API concepts. In addition, non-newcomers (e.g. those developers who have already learned the system's basics and now looking for solving some advanced problems) do not need these ‘example-mix’ articles as they look for some deeper understanding.

#### Introductory notes

Documentation frequently suffers from being excessively clerical; it's being written using formal terminology (which often requires reading the glossary before the actual docs) and being unreasonably inflated. So instead of a two-word answer to the user's question a couple of paragraphs is conceived — a practice we strongly disapprove of. The perfect documentation must be simple and laconic, and all the terms must be either explained in the text or provide a reference to such an explanation. However, ‘simple’ doesn't mean ‘illiterate’: remember, documentation is the face of your product, grammar errors and improper usage of terms are unacceptable.

Also, keep in mind that documentation will be used for searching either, so every page should contain all the keywords required to be properly ranked by search engines. This requirement somehow contradicts the simple-and-laconic principle; that's the way.

#### Documentation Content Types

##### Specification / Reference

Any documentation starts with a formal functional description. This content type is the most inconvenient to use, but you must provide it. A reference is the hygienic minimum of the API documentation. If you don't have a doc that describes all methods, parameters, options, variable types, and their allowed values, then it's not an API but amateur dramatics. Importantly, a reference must contain not only formal definitions but the descriptions of the implicit agreements either, such as the event generation sequence, side-effects of the methods, etc.

Ideally, a reference should be a machine-readable specification, e.g. comply with some standard, for example, OpenAPI.

##### Examples

From the above mentioned, it's obvious that code examples are the crucial tool to acquire and retain new API users. It's extremely important to choose the examples that help newcomers to start working with the API. Improper examples selection will greatly reduce the quality of your documentation. While assembling the set of examples, it is important to follow the rules:
  * examples must cover actual API use cases: the better you guess the most frequent developers' needs, the more friendly and straightforward your API will look to them;
  * examples must be laconic and atomic: mixing a bunch of tricks in one code sample dramatically reduces its readability and applicability;
  * examples must be close to real-world app code; the author of this book once faced the situation when a synthetic code sample, totally meaningless in the real world, was mindlessly replicated by developers in abundance.

Ideally, examples should be linked to all other kinds of documentation, i.e. the reference should contain code samples relevant to the entity being described.

More recently, examples are being published as a collection of ready-to-use requests to be used with Postman or similar tools.

**Sandboxes**

Examples will be much more useful to developers if they are ‘live’, e.g. provided as live pieces of code that might be modified and executed. In the case of library APIs, the online sandbox featuring a selection of code samples will suffice, and existing online services like JSFiddle might be used. With other types of APIs, developing sandboxes might be much more complicated:
  * if the API provides access to some data, then the sandbox must allow working with a real dataset, either a developer's own one (e.g. bound to the user profile) or some test set;
  * if the API provides an interface, visual or programmatic, to some non-online environment, like UI libs for mobile devices, then the sandbox itself must be an emulator or a simulator of that environment, in a form of online service or a standalone app.

##### Tutorial

A tutorial is a specifically written human-readable text describing some concepts of working with the API. A tutorial is something in-between a reference and examples. It implies some learning, more thorough than copy-pasting code samples, but requires less time investment than reading the whole reference.

A tutorial is a sort of a ‘book’ that you write to explain to the reader how to work with your API. So, a proper tutorial must follow book-writing patterns, e.g. explain the concepts coherently and consecutively chapter after chapter. Also, a tutorial must provide:
  * general knowledge on the subject area; for example, a tutorial to some cartographical API must explain trivia regarding geographical coordinates and working with them;
  * proper API usage scenarios, e.g. the ‘happy paths’;
  * proper reaction to program errors that could happen;
  * detailed studies on advanced API functionality (with detailed examples).

As usual, a tutorial comprises a common section (basic terms and concepts, notation keys) and a set of sections regarding each functional domain exposed via the API.

##### Frequently asked questions and a knowledge base

After you publish the API and start supporting users (see next chapter) you will also accumulate some knowledge of what questions are asked most frequently. If you can't easily integrate answers into the documentation, it's useful to compile a specific ‘Frequently asked questions’ (aka FAQ) article. A FAQ article must meet the following criteria:
  * address the real questions (you might frequently find FAQs that were reflecting not users' needs, but the API owner's desire to repeat some important information once more; it's useless, or worse — annoying; perfect examples of this anti-pattern realization might be found on any bank or air company website);
  * both question and answer must be formulated clearly and succinctly; it's acceptable (and even desirable) to provide links to corresponding reference and tutorial articles, but the answer itself can't be longer than a couple of paragraphs.

If technical support conversations are public, it makes sense to store all the questions and answers as a separate service to form a knowledge base, e.g. a set of ‘real-life’ questions and answers.

##### Offline documentation

Though we live in the online world, an offline version of the documentation (in a form of a generated doc file) still might be useful — first of all, as a snapshot of the API valid for a specific date.

#### Content Duplication Problems

A significant problem that harms documentation clarity is the API versioning: articles describing some entity across different API versions are usually quite similar. Organizing convenient searching capability over such datasets is a problem for internal and external search engines as well. To tackle this problem ensure that:
  * the API version is highlighted on the documentation pages;
  * if a version of the current page exists for newer API versions, there is an explicit link to the actual version;
  * deprecated API versions docs are pessimized or even excluded from indexing. 

If you're strictly maintaining backwards compatibility, it is possible to create single documentation for all API versions. To do so, each entity is to be marked with the API version it is supported on. However, there is an apparent problem with this approach: it's not that simple to get docs for a specific (outdated) API version (and, generally speaking, which capabilities this API version provides). (Though the offline documentation we mentioned earlier will help.)

The problem becomes worse if you're supporting not only different API versions but also different environments / platforms / programming languages. For example, if your UI lib supports both iOS and Android. Then both documentation versions are equal, and it's impossible to pessimize one of them.

In this case, you need to choose one of the following strategies:
  * if the documentation topic content is totally identical for every platform, e.g. only the code syntax differs, you will need to develop generalized documentation: each article provides code samples (and maybe some additional notes) for every supported platform on a single page;
  * on the contrary, if the content differs significantly, is in the iOS/Android case, we might suggest splitting the documentation sites (up to having separate domains for each platform): the good news is that developers almost always need one specific version, and they don't care about other platforms.

#### Was This Article Helpful To You?

[Yes / No](https://forms.gle/WPdQ9KsJt3fxqpyw6)
