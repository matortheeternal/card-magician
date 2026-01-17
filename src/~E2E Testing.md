# Proposal ~ E2E Testing

## Motivation
End-to-end testing is a highly effective strategy for identifying real user-encounterable
issues with an application reducing reliance on human QA processes. Card Magician would 
benefit from having E2E tests that touch the critical paths of the application, which can
then be run by automated test runners as needed in multiple different contexts. Adding 
support for E2E tests and making them easy to produce will pay dividends over time for 
producing consistent, high-quality experiences for end users.

## Current behavior
The project currently has a Jasmine test runner which can be executed with `npm run test`
which passes an argument to the application `--run-tests`. This test runner executes unit
tests on the application at runtime. Unit tests, while valuable sometimes, don't test the
actual real-world behavior of an application, and therefore have limited utility relative
to the effort required to produce them for Card Magician's UI-heavy workflows.

## Proposed solution
Add an argv-driven E2E test runner to the application which can be used to execute a set 
of high-impact smoke-tests and expanded in the future if needed. This proposal suggests 
using @testing-library/dom and @testing-library/user-event for base testing primitives. 

Create a minimal in-house "test recorder" which allows a developer to interact with the 
application and automatically produce a skeleton for a test based on their actions. The
recorder may be built to infer certain minimal assertions contextually.

Some elements in the application will need to be decorated with additional scoped, 
semantically appropriate attributes to enable unique and robust selectors. This proposal 
suggests a homegrown system which will be provided with a collection of definitions for 
regions and interaction points so it may generate these selectors.

### Standards
A lot of software currently uses some combination of Playwright, Cypress and Selenium.
While frameworks like these frameworks are common in web projects, they assume external
browser control and introduce significant complexity that does not align well with 
Neutralino’s execution model or this project's minimalistic architectural philosophy.

Recording of E2E tests is something that certain tools are capable of, such as testcafe.

#### Magic Set Editor
To my knowledge, Magic Set Editor has no E2E tests.

### Risks and tradeoffs
- *What security considerations are there for this solution?*
  - It would be nice to not ship tests to users. Currently, the Jasmine test runner is
    included in production builds. We want to avoid this going forward by making it so 
    test runners are distinct bundles that are not included in production builds. Doing
    this will mean that production builds are unaffected by tests.
- *What user pain does this solution solve?*
  - E2E tests allow us to provide releases to end users with a greater degree of 
    confidence that the software works as intended for the operations that we have 
    produced tests for.
- *What user pain could this solution create?*
  - None, users don't run tests.
- *What maintenance burdens could this solution introduce?*
  - Producing tests can be annoying to developers. If it becomes the expectation for pull
    requests, it could be a barrier to contribution. Tests should be treated as optional,
    and producing them should be optimized to be as painless as possible.
  - It will be important to avoid flaky tests or long, slow CI runs as the system 
    develops and matures.
- *How does the solution balance simplicity and functionality?*
  - @testing-library/dom is a minimal dependency in line with the architectural values of
    the project. A test recording system delivers great value to developers and could 
    provide value for troubleshooting or issue submission in the future.

## Alternative solutions

### Don't do it
Prefer human-driven QA. This means more issues may make it into the software, and there 
may be higher pressure to release hotfixes after releases, but could be fine at the early 
stage we are currently at. Adding E2E tests may be more challenging in the future once 
the software has grown and matured.

### Try to make playwright work
Playwright may be appropriate for projects that can rely on external browser automation, 
but Neutralino’s architecture makes this a poor fit in this case. The key advantage would 
be using a framework which more developers are familiar with.

## Open questions

### Does the dependency choice make sense?

### Are the other libraries you would like to see considered, and if so, why?

### Is interaction recording capability a good idea and worth building?
Consider Google Chrome has the ability to 
[record user flows](https://developer.chrome.com/docs/devtools/recorder).

### Would you be willing to write E2E tests on code you submit to the repository?

### How should E2E tests work for modules?
How could modules provide contextual testing equipment/tests? Should it be idiomatic for
modules to register test helpers or entire tests?
