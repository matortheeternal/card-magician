# Platform adapter

This is the renderer's boundary for native filesystem, storage, dialogs, logging,
and lifecycle operations. Keep Electron imports in the host, not in UI/domain code.
The preload bridge also supplies the read-only `appEnvironment` metadata.

Operations are asynchronous and reject with `Error` objects carrying native `code`
values. Binary reads return `ArrayBuffer`; writes accept binary buffers. Directory
entries expose `entry`, `path`, and `type`. Relative filesystem paths resolve
against the application's content directory, with no extension-specific routing.
Use `appEnvironment.paths.extensions` or `getExtensionDirectory()` for extension
files. The single `/extensions` browser mount maps to that selected native root.
Mounted URLs are distinct from native filesystem paths; `MountedDirectory` keeps
the two addresses together for directory-relative operations.
