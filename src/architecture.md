# Purpose
This document explains for the broad architectural decisions in this codebase. It is intended to be read by both current and prospective developers. It is intended to empower individuals to understand how this codebase operates and how to contribute to it effectively.

The goal of this document is not to prescribe rules. Rather, it exists to provide insight into the philosophy and spirit that have shaped and continue to shape this project.

This is a living document, not a constitution. Active maintainers are encouraged to alter it as they see fit.

## Design philosophy

1. Favor simple, imperative code.
2. Prefer explicit contracts over magical action-at-a-distance.
3. Optimize for developer cycles first, machine cycles second.
4. Design to make debugging easy rather than trying to prevent all forms of misuse.
5. Structure code so that files and functions can be understood in isolation.
6. Pursue decoupling, but accept some coupling in service of simplicity.
7. Document how the system behaves rather than enforcing how it must be used.

### 1. Favor simple, imperative code.
Allow dependencies which are used in narrow contexts; avoid framework dependencies
which require distributed coupling. Allow abstractions which are in service to making
the code easier to understand; avoid abstractions which obfuscate understanding.

### 2. Prefer explicit contracts over magical action-at-a-distance.
Code that relies on implicit or "magical" behavior is difficult to reason about. Even
if it requires more verbose code, an explicit contract is usually easier to learn and
easier to debug when things go wrong.

### 3. Optimize for developer cycles first, machine cycles second.
Always write code considering the experience of future developers. Optimization is
good when it can be done without compromising on other key requirements such
extensibility, composability, reusability, or clarity.

### 4. Design to make debugging easy rather than trying to prevent all forms of misuse.
Choices that protect developers against themselves usually increase complexity while
creating barriers against potentially valid usage patterns. Provide tools and safety
valves to reduce the pressure on developers, but don't design a system with training
wheels. Trust future developers to be capable of making good decisions.

### 5. Structure code so that files and functions can be understood in isolation.
Structure code so that files and functions can be fully understood with minimal effort.
When a function or file becomes difficult to explain or reason about locally, it is
often a signal that it should be broken into smaller pieces.

### 6. Pursue decoupling, but accept some coupling in service of simplicity.
Decoupling is highly valuable to enable reuse, but in some cases reuse is not a
first-class concern. In these cases, coupling is acceptable when it allows for
components that are simpler and easier to understand.

### 7. Document how the system behaves rather than enforcing how it must be used.
Enforcement generates tension and is difficult to get right. Prefer to document how
a system behaves and why so developers can be empowered to make informed decisions
rather than being constrained by rigid rules.

## Boundaries
The architecture of this application was chosen with a few major goals in mind:

1. Provide an expressive and fully functional system for designing card templates
   through highly reusable modular components.
2. Make the template and modular component systems as easy to understand as possible
   without compromising on required functionality, modularity, or composability.

Importantly, this system is not trying to create entire new languages or technologies,
it's trying to map the powerful and expressive tools in HTML, CSS, and JavaScript to
its problem space as cleanly as possible.

Choices such as a lack of strict boundaries between modules and the lack of a full
frontend framework like React were made intentionally in service to these goals.

## Additional reading
The following documents describe some of the larger systems and components of the
codebase in more detail. This is not required or expected reading. When working on a
particular area of the codebase, read the documentation closest to that code.

- [Reactivity](./shared/reactivity.md)
- ReactiveComponent
- FieldComponent
- Localization
- Modal
- actionSystem
- hotkeySystem
- BaseCardModel
- CardMagicianModule
- CardMagicianGame
- ImageOperation
- setManager
- Serializer
- morphHTML
