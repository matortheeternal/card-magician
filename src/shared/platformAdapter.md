# Platform adapter

This is the renderer's boundary for native filesystem, storage, dialogs, logging,
and lifecycle operations. Keep Electron imports in the host, not in UI/domain code.
The preload bridge also supplies the read-only `appEnvironment` metadata.

Operations are asynchronous and reject with `Error` objects carrying native `code`
values. Binary reads return `ArrayBuffer`; writes accept binary buffers. Directory
entries expose `entry`, `path`, and `type`. Relative `extensions/` paths resolve
against the executable directory in packaged builds. Other relative paths resolve
against the application's writable content directory. Mounted paths are browser
URLs, distinct from native filesystem paths. Extension discovery in `extensionManager.js`
keeps `/extensions` and `/user-extensions` separate. `MountedDirectory` translates
directory-relative operations into filesystem paths or browser URLs.
