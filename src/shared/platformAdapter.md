# Platform adapter

This is the renderer's boundary for native filesystem, storage, dialogs, logging,
and lifecycle operations. Keep Electron imports in the host, not in UI/domain code.
The preload bridge also supplies the read-only `appEnvironment` metadata.

Operations are asynchronous and reject with `Error` objects carrying native `code`
values. Binary reads return `ArrayBuffer`; writes accept binary buffers. Directory
entries expose `entry`, `path`, and `type`. Relative paths resolve against the
application's writable content directory. Mounted paths are browser URLs, distinct
from native filesystem paths.

The plain `filesystem` service is a seam for domain-unit tests, so they do not spy
on framework internals. Those tests complement the real filesystem, application,
and shutdown checks; mocks do not establish persistence or lifecycle correctness.
