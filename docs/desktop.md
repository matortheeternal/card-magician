# Desktop development and packaging

Card Magician runs on Electron with its existing HTML/CSS/JavaScript frontend.
Use Node 24 and `npm ci`. The Electron version and packaging tools are pinned in
`package-lock.json`; the first runtime launch downloads its binary if it is absent.
No native application compiler or separate browser installation is required.

## Commands

| Command | Purpose |
| --- | --- |
| `npm start` | Build and run with the rebuild server |
| `npm run start:app` | Build and run without the development server |
| `npm run localize` | Run the localization workflow |
| `npm test` | Run the 72 domain/unit specs in Electron |
| `npm run test:native` | Run filesystem/content-upgrade tests against real files |
| `npm run smoke` | Run application and shutdown integration checks |
| `npm run smoke:exit:mutations` | Verify shutdown regressions are detected |
| `npm run probe` | Save/reopen/export a representative card and capture evidence |
| `npm run package` | Produce an unpacked application for the host platform |
| `npm run dist` | Produce installers for the host platform |
| `npm run dist:linux` | Build AppImage and Debian packages |
| `npm run dist:win` | Build the Windows x64 NSIS installer |
| `npm run dist:mac` | Build macOS DMG and ZIP artifacts |

Additional builder flags can be passed after `--`, for example
`npm run dist -- --mac --arm64`. Installer builds share a staging directory and run
sequentially. Artifacts are written under `dist/`; nothing is published by these
commands. Native macOS tools are needed to create DMGs. Windows installers can be
built on Linux with Wine; CI builds each platform on its native runner.

The NSIS installer offers installation-directory selection and preserves application
data on uninstall. Linux packages register a desktop launcher and the app icon.
The GitHub workflow builds Linux x64, Windows x64, and macOS arm64/x64 artifacts,
after testing on all three operating systems. Woodpecker also runs Linux checks.

Signing and notarization use electron-builder's normal credential environment
variables, such as `CSC_LINK` / `CSC_KEY_PASSWORD` and the Apple notarization
credentials. No certificates or publishing credentials are embedded in the project.
Local artifacts are unsigned. Do not describe unsigned local builds as signed or
notarized releases. Automatic application updates are not implemented.

## Storage and extensions

The profile is `card-magician` under Electron's OS application-data directory
(`~/.config/card-magician` on Linux). `--profile=/absolute/path` selects an isolated
profile. Its `data` folder contains settings, collections, errors, logs, and image
cache; `--data-dir=/absolute/path` overrides that folder. Project files and their
sidecar images retain their existing formats.

Development loads games, modules, templates, exporters, scripts, and locales from
the checkout. Packaged applications seed writable copies into the profile's
`content` folder. A content manifest tracks the shipped hashes. On version changes,
unchanged bundled files are upgraded and obsolete defaults removed; edited files
and custom files are preserved. Increment the application version when changing
bundled content. Application binaries and the ASAR archive remain immutable.

## Host architecture

The renderer uses `src/shared/platformAdapter.js`. Filesystem operations, dialogs,
storage, resource mounts, and lifecycle control cross an isolated preload bridge
into the native operation table. The renderer is sandboxed, has context isolation,
and has no Node globals. `appEnvironment` provides paths, version, arguments, and
the development flag before any application module executes.

The host is split into `FileSystem`, `Storage`, `ContentStore`, `ResourceServer`,
`NativeBridge`, and `WindowLifecycle`. File writes use temporary siblings and atomic
replacement. Mounted resources are served at `cm-app://app/`, retaining the existing
`/project`, `/modules`, `/games`, `/templates`, and `/cache` URL structure. Symlink
escapes are rejected and responses disable caching so changed projects/files do not
reuse stale mounted content. External navigation and new browser windows are blocked;
explicit HTTP(S) links use the system browser.

Installed modules and user scripts are trusted application code. Renderer isolation
does not make extensions with access to the native bridge untrusted-code sandboxes.
Keep native calls inside the platform adapter when adding features or another host.
See [shutdown behavior](exit-behavior.md) for persistence registration and failure handling.

## Distribution size

Production builds retain names used by the graphics-operation registry, while
minifying scripts and CSS and omitting source maps. Packaging uses a staged allowlist
of application folders, excludes development dependencies and tests, omits unused
asset directories, and packages application files in ASAR. Browser locales are
limited to `en-US`; application translations are separate. Extend `electronLanguages`
when additional browser UI localizations are needed.

An after-pack check rejects dependency folders, maps, test files, and missing
required runtime resources. Packaged fuses disable Node execution mode, Node options,
and Node CLI inspection, and require the ASAR archive. Chromium's graphics libraries,
software rendering fallback, ICU data, and license files are retained.

Local Linux x64 measurements with Electron 45.2.1: approximately 333 MiB installed,
154 MiB AppImage, and 151 MiB Debian package. The initial feasibility package was
about 342 MiB installed and its gzip archive about 177 MiB. Compression formats
are different, so compare actual download sizes rather than treating those figures
as an isolated compression benchmark. Chromium and the card assets dominate the
remaining footprint. A sampled large PNG was already optimally compressed by
OptiPNG; no image quality or resolution reductions were applied to card assets.

## Evidence and acceptance

The local application passed 72 unit specs, 54 application smoke specs, six native
shutdown scenarios, native file tests, and both shutdown mutation checks. The compact
ASAR-packaged Linux application also passed the six shutdown cases and the probe.
Windows NSIS, Linux AppImage, and Debian installers were generated locally. macOS
installer generation and native Windows/macOS execution are configured in CI but
have not been run remotely as part of this local work.

The probe creates a card through the normal workflow, saves and reopens the project,
exports a PNG, checks native bridge restrictions and mounted-resource containment,
and captures the window. Evidence is under `.tmp/electron-evidence`. To run it
against the packaged Linux binary:

```sh
ELECTRON_SMOKE_BINARY="$PWD/dist/linux-unpacked/card-magician" \
    node tasks/electron/probe.js --output=.tmp/packaged-evidence
```

The representative 750 × 1046 export is 774,176 bytes, with SHA-256
`c4fbd49c9f8d10a337439836eb388a657668f5f79f70e31a814a7140e510dcc8`.
Development and packaged Electron produced the same export. This is one fixture;
review more templates, large projects, and high-DPI displays before a public release.
The existing clipboard specs mock browser APIs, so actual OS clipboard interoperability
and native file-dialog interaction still need manual/native-platform acceptance.

Probe timing includes project creation, reopening, and export. Its summed process
working sets double-count shared pages and include GPU/export work; they are not
an idle/private-memory measurement. Preserve the raw metrics for comparable testing.
