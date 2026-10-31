# Shutdown and persistence

Electron owns the native window. `WindowLifecycle` cancels window-close and
application-quit requests immediately, then notifies the renderer. The window
remains interactive while the application's `ExitManager` shows its progress modal
and flushes registered saves. Successful completion explicitly exits Electron;
save failures keep the application open and can be retried by requesting close
again. Repeated requests share the in-progress shutdown operation.

All renderer native calls go through `src/shared/platformAdapter.js`, the isolated
preload bridge, and the main process's operation table. Domain and UI code do not
import Electron. `src/lifecycle.js` owns application save coordination, while
`electron/WindowLifecycle.js` owns native close/quit control. No unload handler or
browser confirmation dialog participates in normal shutdown.

Filesystem writes are written to temporary sibling files and renamed after writing
completes, preventing failed writes from truncating existing files. An acknowledged
write is not a guarantee against hardware failure, forced termination, or power
loss. Keep explicit save operations and autosave; shutdown is an additional flush.

## Registering saves

`beforeExit(callback, hasPending)` registers a flush callback and a synchronous
pending predicate. `registerPendingSave` integrates debounced component saves,
including pending work after a component is detached. Collection managers and
application settings retain failed saves so later flush attempts can retry.

Callbacks must finish their actual persistence work before resolving. Merely
starting an asynchronous write or firing a debounce does not satisfy that contract.
A callback should be safe to invoke after the same data was already saved.

## Testing

`npm run smoke:exit` launches real windows with isolated temporary profiles. It
checks native window close, File > Exit, reopen, real filesystem failure and retry,
direct native exit, and application quit. Tests clear an actual image-editor field
and request closure before its three-second debounce. A test-only completion gate
lets the driver observe the progress modal and verify the disk write while the
window remains open. Filesystem writes and failures are real. Tests also wait for
the browser processes to terminate.

`npm run smoke:exit:mutations` removes collection flushing and close registration
from the generated development bundle one at a time. Each mutation must fail for
the expected persistence/progress reason. The original bundle is restored afterward.

The framework's native close and quit methods are invoked through gated test
operations. This tests the same entry points as the close button and OS application
quit, without mocking lifecycle events. These operations require a test application
ID and explicit test argument. Production launches do not expose them.
