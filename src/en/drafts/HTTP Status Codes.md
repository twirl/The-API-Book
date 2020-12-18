### HTTP Status Codes

The situation with HTTP status codes demonstrated a disastrous colliding of a well-meaning specification design with a ruthless reality as nothing before. This collision actually comes from three sides.

As we discussed in the [Chapter 10](https://twirl.github.io/The-API-Book/docs/API.en.html#chapter-10), one goal of making errors semantic is to help clients understand, what caused an error. HTTP errors, outlined in the corresponding RFCs (most recently in the [RFC 7231](https://tools.ietf.org/html/rfc7231#section-6)), are specifically designed bearing this purpose in mind. Furthermore, the REST architectural constraints, as [defined by Fielding](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm), imply that not only end user agents should understand error code, but also every network proxy between a client and a server (the ‘layered’ architecture principle). And, in accordance to Fielding's writings, HTTP status code nomenclature does extensively describe virtually every situation which could happen with your HTTP request: wrong `Accept-*` headers value, `Content-Length` is absent, HTTP method is unsupported, URI too long, etc.

What the RFC fails to describe is what to do with the error. As we discussed, errors could be resolvable or not. If the error is unresolvable, all this status codes and headers stuff is simply irrelevant to clients, even more so to interim proxies. In fact, three error codes are enough:
  * `400` to denote persistent situation (error couldn't be resolved by just repeating the request);
  * `404` to denote ‘uncertainty’ cases (the request could be repeated — possibly with different outcomes);
  * `500` to denote server-side problems, with `Retry-After` header to indicate the desirable retry period.

**Aside note:** mark a design flaw here. All `4xx` status codes are by default not cacheable, except for `404`, `405`, `410` and `414`, which are cacheable. We presume that editors of the spec did this with the best intentions, but the number of people who knows this nuance is probably quite close to the number of the spec editors. As a result, there are lots of cases (the author of this book had to deal with one) when `404`s were returned erroneously and cached on clients, thus prolonging the outage for an indefinite time.

As for *resolvable* errors, having status codes nomenclature partially helps. Some of them are concrete, like `411 Length Required`, for example; others are not. There are several situations where just having a code is not enough:
  * `400 Bad Request` code when some parameters are invalid or missing. This error makes absolutely no sense to clients unless specific missing or invalid field is specified — but that's exactly the thing the standard does nothing with! There are no conventional standards to specify which parameter is wrong exactly. Yes, we can, of course, invent a standard of our own, but that would contradict the REST idea of protocol transparency.  
    **NB**: some purists insist, that a `400` code indicates a problem with the request itself, i.e. malformed URI, or header, or body, etc. Sometimes `422 Unprocessable Entity` or `412 Precondition Failed` are claimed to be the ‘right’ code for invalid parameters error. It doesn't change anything, of course.
  * `403 Forbidden` when some authorization or authentication error occurs. There are several quite different `Forbidden` situations, which require quite different actions from the client:
      * an authorization token is missing — the user must be invited to log in;
      * the token is expired — the token refreshing procedure must be conducted;
      * the token belongs to other user — usually indicates that some caches are stall;
      * the token is revoked — usually a result of user logging out on all devices;
      * the user is bruteforcing the authorization endpoint — some antifraud action is required;
      * etc.  
    Each `403` reason indicates quite different scenarios, some of them (bruteforcing) have nothing in common with others.  
  * `409 Conflict`;
  * tons of them.

So we quite naturally are moving to the idea of denoting error details with headers and/or response bodies, not trying to invent a specific error code to each situation. It's quite obvious that we can't design a new error code for every possible parameter missing in case of `400` error, for example.

**Aside note**: the spec authors understood this too, adding the following sentence: ‘The response message will usually contain a representation that explains the status’. We couldn't agree more, but this sentence not only renders the entire spec section redundant (why use status codes in the first place?), but also contradicts to the REST paradigm: other agents in the layered system couldn't understand what the response message explains, thus making the error appear opaque to them.

The conclusion seems to be: use status codes just to indicate a general error class, expressed in the HTTP protocol terms, and fill the response body with details. But here the third collision occurs: the implementation practice. From the very beginning of the Web, frameworks and server software started relying on status codes for logging and monitoring purposes. I think I wouldn't exaggerate gravely if I said that there were literally no platform which natively supported building charts and graphs using custom semantic data in the responses, not status codes. One severe implication is that developers started inventing new codes to have their monitoring work correctly, cutting off insignificant errors and escalating vital ones.

Not only the number of status codes soared, but also their semantic meaning stirs. Many developers simply never read specs. The most evident example is the `401 Unauthorized` code: the spec prescribes the servers to return `WWW-Authenticate` header, which they never do — for obvious reasons, since the only usable value for this header is `Basic`. Furthermore, the spec is extensible at this point, new authentication realms could be introduced and standardized — but nobody cares. Right now using `401` to indicate an absence of authorization headers is a common practice — omitting the `WWW-Authenticate` header, of course.

In a modern world we have to deal with a literal mess: HTTP status codes are used not for the protocol's purity sake, but to build the graphs; their semantic meaning forgotten; and clients often don't even try to get some useful information from the status codes, reducing them to the first digit. It's also a common practice to return resolvable errors as `200`s.

As an example, a real situation the author of this book had to deal with: let's imagine we have an app, and there is a mistake in the code. If an authorization token is stall, it will be never renewed. Tokens become stall, for example, in 30 days, so this mistake wasn't found by QA engineers, and the app was released, for example, on June, 1. The release procedure was incremental: 1% of users got the release initially, then, gradually, it was shipped to everyone.

After 30 days passed, on July, 1, we started to get some troubling support tickets, literally one or two. Several percent of 1% of auditory had troubles with authentication, but we couldn't see it: our `403` graphs looked normal, and when we examined specific users' logs, they look simply like users got their token expired somehow. So we didn't ring the bell and considered the problem being minor issue.

Several days passed, more and more users got involved in the problem, until at some moment (30 days after the release hit 100% users) we've got instantly overloaded with reports, and all graphs went red. We spent several stressful hours looking for a problem cause, making hotfixes, and shipping a new release. All of this would have never happened, if we had had our graphs grouped by logical error reason, not only HTTP codes. If we had had a separate graph for the ‘token expired’ error, we would have noticed the numbers increasing sharply. But we hadn't. There was always a considerable number of `403`s on our graphs: banned users, robots, revoked tokens, etc.; the problem involving just several percent of several percent of users simply had no chance to caught our attention.

#### So, what are you proposing, pal?

Actually, there are three different approaches to solve this situation.

  * Abandon REST paradigm, stick to pure RPC. Use HTTP status codes to indicate the problems with the HTTP network layer itself. So you would actually need just 2 of them:
    * `200 OK` if the server got the request, regardless of the result — execution errors are to be returned as `200`s;
    * `500 Internal Server Error` if the request can't reach the server.  
    You may employ the `400 Bad Request` also, to denote client errors; it slightly complicates the setup, but allows for using some interim software like API gateways.

  * ‘Run with scissors’, using common practices, just cautiously, avoiding violating HTTP semantics. Use HTTP status codes to separate graphs (sometimes using exotic codes). Describe errors semantically and make sure clients don't try to detect anything valuable from the status codes.  
    **NB**: some industrial-grade platforms manage to do both, i.e. combine a pure RPC-style approach with extensively employing various HTTP status codes to indicate a subset of problems (`403`s and `429`s for instance, which are purely business logic-bound, having nothing to do with the HTTP itself). Though in a practical sense this approach seems to work, it's very hard to to tell which problems they face in modern smart-proxy rich environments, not mentioning aesthetic impressions. 

  * Try organizing the mess. Including, but not limited to:
    * using HTTP codes to indicate the problems expressible in HTTP terms (like using `406 Unacceptable` to indicate invalid `Accept-Language` request header value);
    * defining additional machine-readable error response details, preferably in a form of HTTP headers (since reading them doesn't require parsing the entire response body, so interim proxies and API gateways might operate them less expensively, and they could be easily logged); for example, use something like an `X-My-API-Error-Reason` header limited to pre-defined semantic errors nomenclature;
    * customize graphs and monitoring to make them use this specific data in addition to the status codes or instead of them;
    * make sure that clients are treating status codes and the error details correctly, especially with regard to dealing with unknown errors.

The choice is yours, though we have to warn you that option \#3 is quite expensive in implementing.