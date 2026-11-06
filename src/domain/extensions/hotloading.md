# Extension hotloading

Newly installed templates, cardparts, and exporters activate immediately after
installation. Templates refresh existing selectors without rebuilding card data;
exporters refresh open pickers; cardparts remain loaded on demand. Activation uses
a fresh mounted URL root with the existing installation directories.

Existing-extension updates and game changes still require reload. Live replacement,
deferred update installation, and hot uninstallation are not implemented. The update
strategies below describe the intended next stage.

Policy: prefer hotloading for templates, cardparts, and exporters.
Game changes require an application reload. A renderer reload is sufficient;
restarting the Electron process is unnecessary.

## Strategies by type

| Type | New installation | Update | Limitations |
| --- | --- | --- | --- |
| Template | Register its metadata and views; refresh template selectors. | Replace its registration and rebuild affected card faces with their current values. | Rebuild forms and styles too. Field/schema changes may require migration to preserve data. |
| Cardpart | Make it available to the existing on-demand loader. | Import through a fresh URL root; dispose and rebuild every affected live card face, including subcards. | Stop old renders and callbacks, remove old styles, and invalidate affected asset/font caches. Replacing the constructor alone does not update existing instances. |
| Exporter | Register metadata and its form; refresh exporter selectors. | Clear the cached exporter class, use a fresh URL root, and refresh its form and registration. | Let active exports finish before replacing files. Preserve project exporter settings; changed settings may require migration. |
| Game | Reload before activation. | Reload before activation. | Games initialize shared state and register UI components. Save or explicitly discard unsaved work before reloading. |

Registrations should replace by extension ID. Re-running the current discovery
functions would append duplicates. Updates must also account for consumers of the
changed extension, including dependencies used by templates and running exports.

## Fresh URLs without versioned installation folders

Keep the existing installation layout. Give each activated revision a unique
browser mount, such as `/extension-runtime-<generation>`, pointing at its installed
folder. `MountedDirectory` already separates the URL from the filesystem path.
Relative imports then resolve beneath the new root, giving the whole internal
module graph fresh URLs. A query parameter on `main.js` alone is insufficient.

Use the same directory abstraction for assets and supporting file reads. Hardcoded
stable URLs bypass this mechanism. A temporary runtime copy is an option when old
and new consumers must coexist, but is unnecessary when replacement can pause and
dispose all affected consumers first.

## Replacing files in place

Old files need not remain after their consumers have stopped. Loaded JavaScript
stays available in memory, but that does not guarantee every file is cached:
`loadFile()` reads from disk, and images, fonts, or dynamic imports may be requested
later. The resource server also currently sends `Cache-Control: no-store`.

For an update:

1. Download and verify the package in staging.
2. Pause affected work, capture current card/form values, and dispose old consumers.
3. Replace the installed files and assign a fresh URL root.
4. Invalidate affected application caches and registrations, then rebuild consumers.
5. Restore values, refresh selectors, and resume work.

Do not silently lose unsaved values or leave old asynchronous work running against
replaced files. A short-lived installer backup can support rollback. If activation
cannot recover safely, report the failure and offer a reload.

## Hotloading contract and fallback

Each extension type should have its own activation strategy, sharing the common
installation and activation lifecycle. Code that owns listeners, timers, watchers,
or other external resources must release them during disposal. Game-scoped custom
element definitions and other global registrations cannot simply be redefined;
non-game extensions with such side effects need an explicit cleanup/update path
or a reload fallback.

Disposal removes application references and side effects; it does not evict the
browser's JavaScript module cache. Old module revisions may remain resident until
reload. There is no supported API for manually clearing that cache
([MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)).
