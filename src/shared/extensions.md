# extensions
JavaScript has some gaps in the standard library: some operations which should be
simple aren't available and have to be built. That's what this extensions file is for.

Though it is often considered bad practice to extend prototypes due to the possibility
of conflicts, this only really applies to libraries. Card Magician, being an
application, can extend prototypes with relative safety.  The `addPrototypeFunction`
wrapper does work to protect against overwriting functions that may have been added
by other libraries or later ECMAScript versions.

**Every function here can be used everywhere in the codebase, including in modules.**

## What to add here
Any operation on arrays, objects, strings, functions, or other JavaScript types which
are common and consistent within this codebase. Operations which are not in this
codebase or which are likely to only appear once should not be added here.

## Notes
Each function added to this file should have a JSDoc declaration for ease of use and
should use `addPrototypeFunction`.

If this file gets too large it may be broken into separate files for distinct types,
e.g. `functionExtensions.js`, `objectExtensions.js`,`arrayExtensions.js`, etc.
