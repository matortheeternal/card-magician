# Extension locations

`extensionManager.js` discovers games, cardparts, exporters, templates, and locales
in both the installation and the user's extension directory. Each location has a
browser mount (`/extensions` or `/user-extensions`) and a native filesystem path.
`MountedDirectory` keeps those addresses together: `url()` is for imports and
assets, while `readText()`, `readJson()`, `exists()`, and `readDirectory()` operate on
the corresponding filesystem location. `child()` retains both addresses for a subdirectory.

Discovery checks user extensions first. Matching relative entries take precedence
over distributed entries. Cardparts resolve their complete directory before loading;
assets and supporting files stay in that directory rather than falling back to the
installation. User directories use the same category layout as distributed extensions.
Locales retain their manifest-based discovery through `locales.json`.
