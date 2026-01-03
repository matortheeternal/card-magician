# Documentation
The goal of documentation in this codebase is not completeness or formality, but to
reduce the time required for a capable developer to understand and work within the
system when needed.

## General principles
Documentation should be made to answer some or all of the following questions:

- **What** is this piece of code responsible for?
- **Why** does it exist or work this way?
- **When** should it be used, modified, or avoided?

If these questions are addressed, the documentation is sufficient. Concise, effective
documentation is the ideal: there is no minimum length requirement.

## Markdown documentation
Markdown documentation is used to explain **intent, boundaries, and design decisions**.

Documenting individual functions or symbols in the Markdown documentation is generally
discouraged, due to the risk of that information going stale. Use JSDoc instead when
necessary.

### Placement
Markdown documentation should live adjacent to the code it describes. The primary
convention is to name documentation files after the source file they describe, with
exceptions in certain cases. High-level documentation, such as this document, belongs
at the root of the `src` folder.

## JSDoc
JSDoc is used in a limited capacity for:

- Symbols that are part of a shared or public API surface
- Symbols that are used across multiple parts of the codebase

In this codebase JSDoc is used as a communication tool. Its purpose is to save developer
time. Use it sparingly in ways that create real value, not excessively in a way that
creates noise.

## Documentation is a tool, not an obligation
Documentation exists to support understanding and debugging. It should not be written
for its own sake, nor should it be built with unrealistic expectations of completeness.

When documentation becomes difficult to maintain or keep accurate, it should be reduced
or removed rather than expanded. Remember that the primary goal here is to make software
which solves problems.

Clear code supported by targeted documentation where it adds value is the goal, not
extensive commentary.
