# reactivity
A key requirement of most applications is to be able to react to changes in the
underlying data model by updating computed values, and ultimately the UI which the
user sees. Standard reactivity systems were considered and were used in this codebase
for a time, but were ultimately transitioned away from to reduce complexity and
debugging friction. This has made the system easier to use and reason about.

This reactivity system does not attempt to automatically track dependencies, enforce
immutability, prevent misuse, or manage rendering. It exists to provide a simple,
explicit mechanism for reacting to known changes.

## key design choice: push-based
Many modern reactivity systems are pull based. This means that when you change
something, the system automatically detects that change and informs any reactive
watchers/effects that care about it. This approach can be convenient, but it comes at
a cost.

To make this work, most modern frameworks require you to wrap objects in a
reactive proxy. This comes with several downsides:

- It's easy to forget to make an object reactive, and hard to find the problem
  unless you've run into it many times.
- Proxies are more annoying to inspect in the console.
- The behavior is "magical", it works in a way that isn't explicit or imperative

Additionally, most modern systems use a digest cycle, which can make it difficult to
determine the change that triggered a given effect or watcher because the stack may
be obfuscated by asynchronous or delayed execution.

These drawbacks and associated challenges led to the current push-based system. A push
system forgoes magic in favor of being explicit and imperative. Essentially, you have
to execute a function to tell the reactivity that a change has taken place. In this
system, that function is `changed`.

This gives greater control and makes the system's functionality visible and easily
inspectable, rather than opaque. The additional choice to not use a digest cycle and
to instead have synchronous execution makes `changed` predictable and easy to reason
about. At a later time `changed` may need to be made async, but for now it works as-is,
which is a valuable simplicity.

## key design choice: explicit watchers
Several modern reactivity systems use reactive effects which implicitly find
dependencies during their execution. They do this by watching for access on reactive
objects via their proxy layer, as mentioned in the previous section. Similar to the
previous section, this also is magical, non-imperative, and therefore often difficult
to reason about and debug.

Therefore, this reactivity system uses explicit watchers - it has no concept of
magical "effects". Explicit watchers operate by passing the object to watch and one or
more paths to watch on that object. This creates an explicit contract so you will
always specify exactly what a watcher is watching, and you will always know it is
watching only what you have told it to watch.

## watcher lifetime
As with any reactivity system, it is important to manage the lifetime of watchers. In
this case, `watch` returns an `unwatch` function which can be called to remove the
watcher from the global registry so it will no longer be triggered by changes.

However, it should also be noted that most systems in this codebase wrap `watch` for
you so you don't have to worry about cleanup.  If you're using `watch` inside of a
[ReactiveComponent](../ui/components/ReactiveComponent.md),
[CardMagicianModule](../domain/template/CardMagicianModule.md), or
[CardMagicianGame](../domain/game/CardMagicianGame.md), lifecycle management will
be handled for you.

## execution model
All watchers are invoked synchronously and in registration order when `changed` is
called. There is no batching, scheduling, or deferred execution. Watcher callbacks run
on the same call stack as `changed`, which makes control flow and causality explicit
and easy to inspect when debugging.

## A note on `deepWatch`
The initial implementation of reactivity included `deepWatch` because I thought it
might be needed. So far, it has not been used. This is because there is already syntax
built-in to `watch` and `changed` to watch entire objects for changes, making
`deepWatch` unnecessary for most use cases. This functionality may be removed if a use
case is not found where `watch` and `changed` are truly insufficient.
