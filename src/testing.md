# Testing
Tests exist to catch real failures. A test is valuable when it fails because something
a user depends on is broken, and costly when it fails for any other reason. Every test
is judged by that trade: the failures it catches versus the noise it produces.

This document describes what tests in this codebase should look like. It is a living
document; change it when experience shows a better approach.

## Principles

1. **Test the way the application is used.** The more a test resembles real use, the
   more its passing means something.
2. **Test behavior, not structure.** A test should only need to change when behavior
   changes. Tests that break during refactors without catching a bug are noise.
3. **Put each check at the lowest level that can see the failure.** Logic belongs in
   unit tests. The UI is tested by walking through it, not by inspecting it.
4. **Do not test the same thing twice.** A behavior covered by a journey does not need a
   separate component test, and vice versa.
5. **A test that fails without a real failure is a defect.** Fix it or delete it.

## Kinds of tests

### Unit tests (`*.tests.js`, `*.test.js`)
Unit tests cover logic through its public functions: parsing, importing, naming,
querying, history bookkeeping, path resolution. They do not render UI, inspect the DOM,
or spy on internal methods.

Renderer unit tests run in the Electron test page. Tests that need real game behavior
call `useGame('magic')` from `shared/testing/gameFixture.js`, which loads the game and an
empty in-memory project for that suite. Node tests (`electron/*.test.js`) cover host
code that does not need a window.

### Smoke tests (`*.smoke.js`)
Smoke tests walk through critical user journeys in the running application: they start
where a user starts, use the controls a user uses, and check what a user would see or
what ends up on disk. A smoke test is long and covers a whole journey rather than one
control.

Journeys live in `src/journeys`, one file per journey area. Each smoke group in
`shared/testing/smokeSuites.json` runs in its own application instance, which is the
main cost of smoke testing, so groups are few: journeys that work inside an open project
share the `Workspace` instance. A top-level `describe` missing from that file fails the
run. Groups listed as start-screen groups in `tasks/smoke.js` begin at the start screen
instead of an open project. Journeys that cross a restart or reload are driven from
Node, as in `electron/tests/shutdown.smoke.js` and `electron/tests/installPackage.smoke.js`.

Only the boundaries of the application are stubbed: operating-system dialogs, the
clipboard, external programs, and URLs. Everything inside the application runs for
real.

### Writing a journey
A journey reads as a sequence of user steps:

```js
await createProjectFromStartScreen(folder);
await createCard();
await setCardFields({ name: 'Lifecycle Bear', artImage: art });
await exportAll();
await reopenFromRecentProjects();
```

Each step is a small function named after what the user does, and it owns the selectors
and waiting needed to do it. Assertions check outcomes a user can rely on: files on disk,
reopened content, visible results. When markup changes, one step changes, not every test
that passes through it. Steps shared by several journeys live in `shared/testing/steps`,
grouped by the part of the application they operate; steps used by one journey stay in
its file.

Menu and shortcut commands are invoked through the same action or system call that the
menu item makes, and awaited, so the journey knows when the command has finished. Flows
whose UI is the subject, such as the start screen, Settings, and dialogs, are clicked
through.

A journey is one `it` that builds on its own earlier steps. Split a journey area into a
few `it`s when parts need a fresh project, and keep each `it` independent of the others.

A journey must leave the application as it found it: no open dialogs, modals, or
unfinished saves. Anything left behind fails the journeys that run after it in the same
instance, which makes the failure hard to trace.

### Regression checks
When a bug reaches a user, add the lowest-level test that would have caught it. Only when
the failure is inherently visual or timing-related (a resize loop, a race between saves)
add a narrow check beside the journey where it occurs, in a `regressions` block or as a
separately named `it`, and name the behavior it guards.

## Critical user journeys
These are the journeys smoke tests should cover. A journey belongs here when breaking it
would stop a user from making or keeping their work.

1. **Start a project**: open the app, create a project from the start screen, reopen it
   from the recent list.
2. **Edit cards**: add, rename, duplicate, delete and select cards; switch faces and
   templates; edit fields, tags, and notes.
3. **Work with art**: add, replace, crop, and remove card images.
4. **Keep work safe**: every edit reaches disk with the expected file names, survives
   reopening, and is flushed when switching projects or exiting.
5. **Undo and redo**: edits, creations, and deletions, including their files.
6. **Copy and paste**: cards and images between and within projects.
7. **Export**: run the configured exporters and find their output.
8. **Bring work in**: import an MSE set; install a package.
9. **Review a set**: open statistics, select a chart region, open the represented card.
10. **Configure**: change project and application settings, including external tools.

## What not to test
- Presentation details such as pixel sizes, computed styles, and DOM structure, unless
  that detail is the bug being guarded.
- Third-party components (Shoelace, D3) or the browser.
- Internal call sequences through spies when the outcome itself can be observed.

## Reliability
- Wait for conditions or events, never for fixed durations. Use `eventually` or the event
  the application emits.
- Each test creates the state it needs. Do not rely on test order or leftover state.
- A test that fails without a real failure is quarantined immediately: fixed or deleted
  within a week. Keep the quarantine small. Failing tests are never retried silently.

## Deciding where a test goes
Ask what a user would notice if the code broke:

- Nothing directly, but a result would be wrong: unit test the logic.
- A journey step would fail: make sure the journey walks through that step.
- Something visual or timing-dependent would go wrong: add a named regression check to
  the journey where it appears.

Before adding a test, break the behavior it guards and confirm the test fails. A test
that still passes is not testing that behavior.
