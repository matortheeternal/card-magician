# Extension directory

`extensionManager.js` discovers games, cardparts, exporters, templates, and locales
in exactly one directory: `appEnvironment.paths.extensions`. The host selects it
at startup:

- `--development` in an unpackaged app selects the repository's `extensions` folder.
- Otherwise, the default is `extensions` inside the application's user profile.
- `--extensions-dir=<path>` overrides either default, including in packaged builds.

There is no fallback, merging, or precedence between directories. Extensions are
not distributed beside the executable or staged as part of application releases.
A fresh profile needs game content supplied separately; the current editor startup
still expects Magic until the game-selection flow is implemented.

`getExtensionDirectory()` returns a `MountedDirectory` with the browser mount
`/extensions` and the selected native filesystem path. `url()` is for imports and
assets; `readText()`, `readJson()`, `exists()`, and `readDirectory()` use the native
path. `child()` retains both addresses for a subdirectory. Localization reads,
writes, and schema generation use this same root, including during development.
Locales retain manifest-based discovery through `locales.json`.
