### Synchronization Strategies

Let's proceed to the technical problems that API developers face. We begin with the last one described in the introductory chapter: the distributed nature of modern software that necessitates the problem of synchronizing shared states. Let us imagine that a user creates a request to order coffee through our API. While this request travels from the client to the coffee house and back, many things might happen. Consider the following chain of events:

1. The client sends the order creation request

2. Because of network issues, the request propagates to the server very slowly, and the client gets a timeout
  * Therefore, the client does not know whether the query was served or not.

3. The client requests the current state of the system and gets an empty response as the initial request still hasn't reached the server:

    ```typescript
    let pendingOrders = await 
    api.getOngoingOrders(); // → []
    ```

4. The server finally gets the initial request for creating an order and serves it.

5. The client, being unaware of this, tries to create an order anew.

As the operations of reading the list of ongoing orders and of creating a new order happen at different moments of time, we can't guarantee that the system state hasn't changed in between. This might happen if the application backend state is replicated (i.e., the second request reads data from a different node of the data storage) or if the customer uses two client devices simultaneously. In other words, we encountered the classical problem of *state synchronization* in distributed systems. To solve this issue, we need to select a *consistency model*[ref Consistency model|ref:steen-tanenbaum-distributed-systems 7.3 Client-centric consistency models](https://en.wikipedia.org/wiki/Consistency_model) for our application and implement some *synchronization strategy*.

As clients are your customers, it is highly desirable to provide them an API with the highest degree of robustness — *strong consistency*,[ref Strong Consistency|ref:gorton-scalable-systems Chapter 12. Strong Consistency](https://en.wikipedia.org/wiki/Strong_consistency) which guarantees that all clients read the most recent writes. It is not universally possible, and we will discuss relaxing this constraint in the following chapters. However, with APIs the rule of thumbs is: if you can provide strongly consistent interfaces, do it.

There are two main approaches to solving this problem: the pessimistic one (implementing locks in the API) and the optimistic one (resource versioning).

**NB**: Generally speaking, the best solution is not having the issue at all. Let's say, if your API is idempotent, the duplicating calls are not a problem. However, in the real world, not every operation is idempotent; for example, creating new orders is not. We might add mechanisms to prevent *automatic* retries (such as client-generated idempotency tokens) but we can't forbid users from just creating a second identical order.

#### API Locks

The first approach is to literally implement standard synchronization primitives at the API level. Like this, for example:

```typescript
let lock;
try {
  // Capture the exclusive
  // right to manipulate orders
  lock = await api.
    acquireLock(ORDERS_ACCESS);
  // Get the list of current orders
  // known to the system
  let pendingOrders = await 
    api.getPendingOrders();
  // If our order is absent,
  // create it
  if (pendingOrders.length == 0) {
    let order = await api
      .createOrder(…)
  }
} catch (e) {
  // Deal with errors
} finally {
  // Unblock the resource
  await lock.release();
}
```

This solution is quite similar to using mutexes to avoid race conditions in multithreaded systems,[ref Lock|ref:stevens-unix-network-programming-2 Chapter 7. Mutexes and Condition Variables](https://en.wikipedia.org/wiki/Lock_(computer_science)) just exposed via a formal API. Rather unsurprisingly, this approach sees very rare use in distributed client-server APIs because of the plethora of related problems:

1. Waiting for acquiring a lock introduces new latencies to the interaction that are hardly predictable and might potentially be quite significant.

2. The locks themselves [i.e., the storage for lock identifiers and its API] constitute a separate subsystem of its own and require additional effort from the API vendor to implement it.

3. As it's partners who develop client code, we can't guarantee it works with locks always correctly. Inevitably, “lost” locks will occur in the system, and that means we need to provide some tools to partners so they can find the problem and debug it.

4. A certain granularity of locks is to be developed so that partners can't affect each other. We are lucky if there are natural boundaries for a lock — for example, if it's limited to a specific user in the specific partner's system. If we are not so lucky (let's say all partners share the same user profile), we will have to develop even more complex systems to deal with potential errors in the partners' code — for example, introduce locking quotas.

#### Optimistic Concurrency Control

A less implementation-heavy approach is to develop an *optimistic concurrency control*[ref Optimistic concurrency control|ref:kung-robinson-occ](https://en.wikipedia.org/wiki/Optimistic_concurrency_control) system, i.e., to require clients to pass a flag proving they know the actual state of a shared resource.

```typescript
// Retrieve the state
let orderState = 
  await api.getOrderState();
// The version is a part
// of the state of the resource
let version = 
  orderState.latestVersion;
// An order might only be created
// if the resource version hasn't
// changed since the last read
try {
  let task = await api
    .createOrder(version, …);
} catch (e) {
  // If the version is wrong, i.e.,
  // another client changed the
  // resource state, an error occurs
  if (Type(e) == INCORRECT_VERSION) {
    // Which should be handled…
  }
}
```

**NB**: An attentive reader might note that the necessity to implement locking has not disappeared: there must be a component in the system that performs a locking read of the resource version and its subsequent change. It's not entirely true as synchronization strategies and strongly consistent reading have disappeared *from the public API*. The distance between the client that sets the lock and the server that processes it became much smaller, and the entire interaction now happens in a controllable environment, being free from the problems we've described earlier.

Instead of a version, the date of the last modification of the resource might be used (which is much less reliable as clocks are not ideally synchronized across different system nodes; at least save it with the maximum possible precision!) or entity identifiers (ETags).

The advantage of optimistic concurrency control is therefore the possibility to hide under the hood the complexity of implementing locking mechanisms. The disadvantage is that the versioning errors are no longer exceptional situations — it's now a *regular behavior* of the system. Furthermore, client developers *must* implement working with them otherwise the application might render inoperable as users will be infinitely creating an order with the wrong version.

**NB**: Which resource to select for making versioning is extremely important. If in our example we create a global system version that is incremented after any order comes, users' chances to successfully create an order will be close to zero.