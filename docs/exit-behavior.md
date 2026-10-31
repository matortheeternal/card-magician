# Application shutdown

`src/lifecycle.js` owns shutdown policy. Startup registers its close handler;
menus request the same exit operation. The adapter exposes native operations,
including `terminateApp`, `onWindowClose`, and intentional reload support.

The local Neutralino fork adds `modes.chrome.exitProcessOnClose: false` support.
Its private DevTools connection cancels Chrome's unload dialog and emits
`windowClose` while the page remains alive. The application paints a progress
modal, flushes registered persistence work, and then requests native termination.
A failed flush leaves the window open with an error and permits retry.

Register persistence callbacks with `beforeExit(callback, hasPending)`.
Components with debounced writers can use `registerPendingSave`; its returned
cleanup callback flushes a detached component before unregistering it. Native
window mode uses the same lifecycle. Chrome/browser runtimes without deferred
close support retain the browser confirmation fallback.

The framework owns the browser process, requests `Browser.close` during
`app.exit`, waits up to three seconds, and terminates its own process group/job
if necessary. It does not terminate unrelated browser profiles. OS force quit
cannot flush application data.

## Pinned fork for developers and CI

`npm ci` installs the Neutralino CLI from package-lock.json, then downloads the
runtime and official JavaScript client pinned in `neutralino.lock.json`.
`npm run runtime:install` repeats setup; `npm run runtime:verify` checks installed
bytes without downloading. Every application build checks the pin as well.

The runtime comes from the fork's tagged GitHub release, not upstream nightly or
a developer's local binary. The archive checksum, embedded source revision, and
per-platform binary checksums must all match the lock. The JavaScript client
and its type definitions are separately pinned to compatible upstream assets.
All supported runtime targets are installed for `neu build` packaging.

Do not use `neu update`, which only supports upstream binary URLs. CI runs the
same installation/verification commands as developers and does not require a
global CLI or compiler. Cached files are checked before reuse; a mismatched
local binary is replaced, and checksum/download errors stop the build.

The fork's `card-magician` branch contains the Chrome lifecycle implementation.
Pushing a `v*-cm.*` tag runs `.github/workflows/card-magician-runtime.yml`, which
builds Linux x64/ARM64/ARMHF, Windows x64, macOS x64/ARM64/universal and publishes
an archive, `runtime.json`, and `SHA256SUMS` in a prerelease. To update the pin,
use those published checksums/revision in `neutralino.lock.json` and set the same
version (without `v`) in `neutralino.config.json`. Keep published tags immutable.

Release: https://github.com/matortheeternal/neutralinojs/releases/tag/v6.10.0-cm.1

## Local Linux fork development

To test uncommitted runtime changes rather than the published fork release:

```sh
cmake -S ../neutralinojs -B /tmp/card-magician-neutralino-build -G Ninja
cmake --build /tmp/card-magician-neutralino-build -j 2
cp ../neutralinojs/bin/neutralino-linux_x64 bin/neutralino-linux_x64
NEUTRALINO_SKIP_INSTALL=1 npm run smoke:exit
```

The opt-out is explicit and prints a message. Normal builds restore the pinned
release. The binary and download cache are ignored by Git.

## Shutdown smoke tests

```sh
npm run smoke:exit
npm run smoke:exit:mutations
```

The external Node runner launches the full application in isolated Chrome
profiles with temporary files. It clears an image through the real editor,
requests close while saving is pending, observes the progress modal, and
requires the changed YAML to reach disk before the three-second debounce.
A test-only gate lets the runner observe the progress state; filesystem and
serialization operations are real. The suite also covers File → Exit, reopening
the saved collection, a real directory/write failure followed by retry, and raw
`app.exit` cleanup. It checks Neutralino's exit and all reported Chrome PIDs.

The mutation command temporarily alters the generated application bundle to
remove collection flushing or close-handler registration. It requires each
broken build to fail the smoke test for its expected reason, then restores the
original bundle in a `finally` block. Do not run another build concurrently.

`npm run smoke` includes the exit suite. The existing suite runner now waits for
process termination after receiving a test result, rather than treating the
result message as proof that shutdown completed.
