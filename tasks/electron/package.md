# Packaging

Application code is bundled into `resources/app.asar`. Games, cardparts, exporters, locales,
and templates are installed in `extensions/` beside the executable so they can be edited or replaced
independently. On macOS the `extensions/` folder lives in the app's `Contents/MacOS` directory.
User extensions live in the `extensions/` directory under Electron's configured
`userData` directory, so `--profile` also isolates extensions. Use
`--extensions-dir=/absolute/path` to override the user directory.

Portable Linux builds use tar.gz so these files remain loose after extraction.

The staging directories separate bundled content from plugins before electron-builder
runs. Keep the staging filter and archive checks consistent when adding runtime files;
frontend dependencies are already bundled and should not be copied again.

Installer targets and signing options belong in `electron-builder.yml`. Run installer
builds sequentially because they share staging directories. macOS DMGs require macOS;
Windows installers can also be built on Linux with Wine.

Compression defaults to level 6. Set `ELECTRON_BUILDER_COMPRESSION_LEVEL` to override it.
