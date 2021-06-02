### The Mythology of REST

#### Hard knowledge

No other technology in the IT history generated as many fierce debates as REST did. The most remarkable thing is that disputants usually demonstrate totally no understanding of the subject under discussion.

Let's start with the very beginning. In 2000 Roy Fielding, one of the HTTP and URI specs authors, defended his doctoral dissertation on ‘Architectural Styles and the Design of Network-based Software Architectures’. Fifth chapter of this dissertation is ‘Representational State Transfer (REST)’. It might be found [there](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm).

As anyone may ascertain upon reading this chapter, it holds quite an abstract overview of distributed network architecture, which is bound to neither HTTP nor URI. Furthermore, it is not at all about designing APIs. In this chapter Fielding methodically enumerates the restrictions which distributed systems software engineer has to deal with. Here they are:

  * server and client must not be aware of each other's internal implementation (client-server architecture);
  * session is stored on client (stateless design);
  * data must be marked as cached or non-cached;
  * interaction interfaces must be uniform;
  * systems are layered, e.g. server might be but a proxy to other servers;
  * client's functionality might be extended by server providing code on demand.

That's all. Essentially REST is defined like this. In the rest of the chapter Fielding elaborates over different system implementation aspects, but all of them are just as well abstract. Literally: ‘the key abstraction of information in REST is a resource; any information that can be named can be a resource’.

The key conclusion from the Fielding's REST definition is actually this: *any network-based software in the world complies to REST principles*, except on very rare occasions.

Indeed:
  * it's very hard to imagine a system which would have exactly no uniform interaction interface; developing such system would be virtually impossible;
  * since there is interaction interface, then it might be mimicked, which means that client and server independency requirement might always be met;
  * since we may always develop an alternate implementation for the server, then we might always make an architecture many-layered, inserting additional proxy between server and client;
  * since client is a computing machine, it always stores some session state and caches some data;
  * finally, code-on-demand requirement is a cunning one: we might always say that the data we've got over network comprise ‘instructions’ of some sort which client interprets.

Of course, all these speculations are ultimately sophistic, reduction to absurdity. Ironically, we might also reduce them to absurdity, taking opposite direction and proving REST requirements unrealizable. For example, the code-on-demand requirement contradicts to the client-server independency principle, since client must interpret server commands written in some specific language. As for the rule under ‘S’ letter (‘stateless’), systems which store exactly no client's context are virtually non-existent because they simply can't do anything valuable. (Which is stated in plain text, by the way: ‘communication … cannot take advantage of any stored context on the server’)

Finally, Fielding himself put additional entropy into the question, releasing [a statement](https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven) in 2008, explaining what he really wanted to say. This article states, in particular, that:
  * A REST API should not be dependent on any single communication protocol;
  * A REST API should spend almost all of its descriptive effort in defining the media types, and these media types shouldn't mean anything to client;
  * A REST API must not define fixed resource names or hierarchies, they must be extracted from server responses.

Ultimately, REST as defined by Fielding-2008 implies that client somehow obtains the entry point to the REST API and since that moment must be able to carry on overall interaction with it, possessing no a priori knowledge of the API, and even more so, no specific code written for this purpose.

Saying nothing about Fielding's loose interpretation of his own dissertation, let us point out that no existing system in the world complies with the Fielding-2008 definition of REST.

#### REST: The Good Part

We don't actually know why of all overviews of abstract network-based architectures the Fielding's one became the most widely known. But it's clearly obvious that Fielding's theory being reflected in minds of millions of developers (including Fielding's own) morphed into a whole engineering subculture. Out of reducing the REST abstractions to the HTTP protocol and the URL standard, the chimaera of ‘RESTful API’ was born — the one which [nobody knowns the exact sense of](https://restfulapi.net/).

Are we saying that REST concept is meaningless? Not at all. We were just trying to demonstrate that it allows for too loose interpretation, which is simultaneously its main power and its main flaw.

From one side, from the plethora of interpretations the API developers built up some fuzzy, but still useful understanding of ‘right’ API architecture. From other side, if Fielding had elaborated over his vision in detail back in 2000, there would have been probably a few dozen of people who have heard anything of it.

So, what's ‘correct’ there in the REST approach to API design, as it formed in the collective conscience of developers? The thing is that it allows to use time more effectively — engineers' time and computers' time.

If we try to summarize all the REST discussion, we would get something like this: *you would rather design a distributed system in a manner allowing all interim agents to read the metadata of requests and responses passing through the system* (a ready commandment for RESTful Pastafarianism!).

The HTTP protocol has one very important feature: it allows external observer to understand a lot what happened with the request and the response, even if this observer has no clue what's the operation itself means:
  * URL identifies some final receiver of the request, a unit of addressing;
  * status code tells us whether the operation was carried out successfully or some error occurred; if the latter is what happened, then we are able to tell who's fault it is (client's or server's), and even fix the problem in some situations;
  * out of request method we might tell whether the operation is modifying; if it is, we may also tell whether it's idempotent;
  * request method and response status code and headers indicate whether the result is cacheable and what's the caching policy.

Importantly, all these data might be obtained without reading the entire response body; reading just headers is enough.

Why we say this is ‘right’? Because modern client-server interaction stack is *layered*, as Fielding points out. Developers write code atop some framework which dispatches requests; the framework is built upon programming language API, which calls operating system functions. After that the request (probably via interim proxies) reaches the server, which in its turn might present several abstraction layers in a form of a framework, programming language, OS, etc. Before actual server code there is usually a web server, seldom even several ones. Finally, in modern cloud architectures HTTP requests pass several additional abstractions, i.e. proxies and gateways, before it reaches the final handler. Obviously, if all these agents interpreted request metadata uniformly, it would allow dealing with many situations more efficiently, using less resources and requiring writing less code.

(Actually, with regards to many technical aspects interim agents are taking many opportunities, not asking the developers about them. For example, freely changing `Accept-Encoding` and therefore `Content-Length` while proxying requests and responses.)

Every REST principle, named by Fielding, allows for making interim software work better. The stateless paradigm is a key: proxies might be sure that request's metadata describe it unambiguosly.

Let's explore a simple example. Imagine we have operations for getting and deleting user's profile in our system. We may organize them in different ways. For example, like this:

```
// Get user's profile
GET /me
Cookie: session_id=<идентификатор сессии>
// Delete user's profile
GET /delete-me
Cookie: session_id=<идентификатор сессии>
```

Why this solution is defective from the interim agent's point of view?

  1. Server can't cache responses; all `/me`-s are the same, since server can't easily obtain user's identifier from the cookie value; interim proxies cannot populate caches beforehand since they don't know session identifiers.

  2. It's hard to organize sharding, e.g. storing different user's data on different network fragments; to do so you still need a method to exchange cookies for user's identifier.

We might partially solve the first problem by making the operations more machine-readable, moving sessions to the URL itself:

```
// Get user's profile
GET /me?session_id=<session identifier>
// Delete user's profile
GET /delete-me?session_id=<session identifier>
```

We still cannot easily organize sharding, but now server could have cache (it will be bloated with copies of the same user's data under different session identifiers, but at least it's impossible to respond incorrectly), but another problems pop up:

  1. URLs shouldn't be stored in logs, since they contain secrets; furthermore, there are risks of leaking users' data, since a URL alone is now enough to access it.
  3. Delete profile links are now to be kept in secret. If you post one of those into a messenger, then the messenger's link prefetcher will delete the profile.

So, how to make this ‘right’ according to the REST principles? Like that:

```
// Get user's profile
GET /user/{user_id}
Authorization: Bearer <token>
// Delete user's profile
DELETE /user/{user_id}
Authorization: Bearer <token>
```

Now the request URL explicitly points to the resource, so we may organize caches and event populate them ahead of time. We are now able to organize request routing depending on user's identifier, therefore sharding is now possible. Messengers' link prefetchers don't follow `DELETE` links; and even if they do, the operation won't be carried out without `Authorization` header.

Finally, one unobvious benefit we might get from this solution is an ability for interim gateway to check `Authorization` header and send the request further without it (preferably using secure connection or at least signing the request) — unlike in corresponding ‘session_id’ scheme, we are still able organize caching and sharding at any middle point. Furthermore, *agents might easily modify operations*; for example, proxying authorized request further as is, but showing special ‘public’ profile to unauthorized users by directing their requests to arbitrary URL like `GET /user/{user_id}/public-profile`. To do so you just need to attach `/public-profile` to the original URL, making no changes to other parts of the request. For contemporary microservice architectures *the ability to modify requests while routing reliably and at no cost is the most valuable benefit of REST*.

Let's make one small step further. What if the gateway proxied `DELETE /user/{user_id}` to the proper endpoint, but got no response back. What variants are possible?

**Option #1**. The gateway might generate HTML page containing error explanation, return it to the web server to return it to client to show it to the end-user. We've driven a bunch of bytes through the system and ultimately put the responsibility on customers. Also note that an error is indistinguishable from a success to all agents from web server on, since the response contains non-machine-readable response bearing '200 OK' status code. If the network connectivity between the gateway and the endpoint is really dropped, nobody will know this.

**Option #2**. The gateway might return an appropriate HTTP error, `504` for instance, to send it back to client to handle the error accordingly to client's inner logic, for example, to retry the request or show an error view to the customer. We've driven slightly less bytes through the system, logged the exception, and put the responsibility on client developers: it's now they who are to write the code handling `504` error.

**Option #3**. The gateway is aware that `DELETE` operations are idempotent, and it repeats the request. If there is no response again, then proceed option #1 or option #2. In this situation we put the full responsibility on system architects, who should design the system-wide retry policy (and guarantee that all `DELETE` operations are *really* idempotent), but we've got an important capability in return: the system became self-recoverable. It's now able to ‘self-restore’ in some cases which previously led to errors.

A mindful reader might note, that option #3 is the most technically challenging of all three, because it actually incorporates options #1 and #2: to make it work properly client developers still need to write the code working with the exceptions. But it's not exactly the same; there is a significant difference in writing code adapted to option #3 compared to #1 and #2: client developers don't care how the server retry policy is structured. The may assume that server has already done all the hygienic job; for example, immediate retrying is useless. All requests to server from this point of view behave similarly, so this functionality (waiting for responses, possible retrying) might be delegated to the framework.

If both frameworks, server's one and client one, are working as intended, situations of uncertainty are no longer a problem to client developers: they are not writing any ‘recover’ logic, when the request failed, but something could be done to ‘repair’ the state. Client-server interaction is now binary, it's either success or failure, with all marginal situations to be handled by other code.

Eventually the architecture which looked most intricate is now split into different responsibility domains, and every developer now minds their own business. Gateway developers are to guarantee optimal routing within the data center; framework developers implement functionality of request timeouts and retries; client developers write business logic, not a low-level recovery code.

**Of course** all these optimizations might be conducted without relying on standard HTTP methods / statuses / headers nomenclature, or the HTTP itself. You just need to develop uniform data format exposing all the metadata, and make interim agents and frameworks understand it. That's exactly what Fielding stated in his dissertations. But it's obviously highly desirable to have this code already being written by someone, not us.

Let us also note that numerous ‘REST API how-to’-s which could be found on the Internet in abundance, are not related to abovementioned principles, and sometimes even contradict them.

  1. ‘Don't use verbs in URLs, nouns only’ — this is just a crutch to help organizing request metadata properly. With regards to working with URLs you actually need to accomplish two things:
      * URLs being a cache key to every cacheable operation, and idempotency key to idempotent ones;
      * it must be easy to understand from the URL how this operation is going to be routed through multilayered system — easy for humans and machines alike.

  2. ‘Use HTTP verbs to describe actions upon resources’ — this is just putting the cart before the horse. The verb must tell us whether the operation is (non-)modifying, (non-)cacheable, (non-)idempotent, and whether the request has body. Instead of choosing the method out of these criteria, some mnemonics is introduced: if the verb aligns well with the semantics of the operation, it suits. This principle might be dangerously misleading in some cases. You might think that `DELETE /list?element_index=3` describes your intention to delete third element of a list perfectly, but this operation is not idempotent, so you can't use `DELETE` verb here.

  3. ‘Use `POST` to create entities, `GET` to access them, `PUT` for full rewriting, `PATCH` for partial rewriting, and `DELETE` for removing’ — again just some mnemonics which allows to figure it out, which side-effects each of the verbs might possibly have. If we try to dig a bit deeper, we will soon realize that this advice quality is somewhat between ‘useless’ and ‘destructive’:
      * using `GET` method in APIs makes sense when and only when you may supply reasonable caching headers; if you set `Cache-Control` to `no-cache`, then you simply have implicit `POST`; if you haven't set them at all, then some interim agent might set them for you;
      * entities creation should be idempotent, ideally behind `PUT` verb (for example, using the [drafts scheme](#chapter-11-paragraph-13));
      * partial updates via `PATCH` is a dangerous and dubious practice, it's better to [decompose it into several simple `PUT`s](#chapter-11-paragraph-12);
      * finally, in modern systems entities are rarely deleted; they are rather archived or marked hidden, so `PUT /archive/entity_id` again would be more appropriate.
  
  4. ‘Don't nest the resources’ — this rule just reflects the fact that entities' relations tend to evolve over time, and strict hierarchies eventually become not-so-strict.

  5. ‘Use plural form for resources’, ‘enforce trailing slash’ and related pieces of advice, which are just about the code style, not REST.

In the end, let us dare to state four rules that would *actually* help in designing a REST API:

  1. Comply with HTTP standard, *especially* regarding the semantics of HTTP verbs, statuses, and headers.
  2. Use URLs as cache and idempotency keys.
  3. Design the architecture in a manner allowing for routing the requests in multilayered system with just manipulating URL parts (host, path, query), statuses, and headers.
  4. Treat your HTTP call signatures as a code, and apply all the same stylistic rules: signatures must be clear, semantic, consistent and readable.

#### REST benefits and disadvantages

The main advantage of building a REST API is an ability to rely on interim agents (from client frameworks to API gateways) reading request and response metadata and employ some actions based on it: tune caching policy, retries and timeouts, logging, caching, sharding, proxying, etc — without the need to write any additional code. It's important to stress it out, that if you are actually don't use all these abilities, you don't need REST.

The main disadvantage of building a REST API is having to rely on interim agents (from client frameworks to API gateways) reading request and response metadata and employ some actions based on it: tune caching policy, retries and timeouts, logging, caching, sharding, proxying, etc — even if you didn't ask for it. Furthermore, since the HTTP is a complicated standard and developers are not ideal, interim agents might treat request metadata *erroneously*. Especially if we talk about some exotic or hard to interpret standards.

Developing distributed systems in the REST paradigm is always a bargain: which functionality you agree to outsource, and which you do not. Alas, the proper balance is usually found with probes and mistakes.

#### On metaprogramming and Fielding's REST

Let us also say a couple of words on REST in its Fielding-2008 interpretation (which is actually based on a well-known [HATEOAS](https://en.wikipedia.org/wiki/HATEOAS) concept). From one side, that's quite a logical extension of the principles stated above: if not only metadata of the current operation were machine-readable, but all possible operations with the resource, it would allow us to build much more functional interim agents. The idea of meta-programming, when the client is such a powerful computing engine that could extend its own functionality without the necessity of hiring an engineer to read the API docs and write the code, looks extremely attractive to any technocrat.

The flaw in this idea is that the client would be extending itself without the developer to read the API docs and write the code. It might be working in the ideal world; in the real world it wouldn't. Any complex API is not ideal, there are always concepts which require a human to understand them (yet). And, as we said before, since an API is a multiplier to both your opportunities and mistakes, the automated API metaprogramming might be a very-very costly mistake.

Until Strong AI is developed, we still insist on writing the code working with APIs by a human who relies on detailed docs, not guesses the meaning of hyperlinks in server's response.