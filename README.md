# card-magician ![](https://ci.codeberg.org/api/badges/18228/status.svg)

Card Magician is a cross-platform application for authoring custom playing cards. It currently supports the creation of custom Magic: the Gathering cards, with support for other games planned.

## development

Use Node.js 24, then run `npm ci` and `npm start`. `npm ci` installs the pinned
[Neutralino fork](https://github.com/matortheeternal/neutralinojs/tree/card-magician)
and JavaScript client automatically; no global `neu` installation or C++ toolchain
is required. Use `npm run runtime:verify` to check the installed files.

Do not run `neu update`: it downloads upstream binaries. Runtime versions, source
revision, and SHA-256 checksums are pinned in `neutralino.lock.json`. Builds check
the pin and restore the fork if installed files differ. See
[the runtime and shutdown guide](docs/exit-behavior.md) for local fork development,
CI, and release updates.

## features

Card Magician currently offers the following features:

- A user extension system for games, templates, card parts, and exporters
- Saving and loading of projects
- Autosave after every change
- Recent projects display
- Card preview
- Editing card fields and options through a form
- Exporting cards as images
- Exporting project information for use on a website
- Exporting projects for Tabletop Simulator
- Pack collation configuration
- Card filtering with Scryfall syntax
- Project metadata configuration
- SVG Set Symbols
- Support for tagging cards and making design notes
- 14 templates for creating Magic: the Gathering cards
- General support for double face cards
- Automatic detection and manual override support for frame elements such as legend crowns, nyx stars, vehicle trim, snow trim, and miracle trim
- Interactive image cropping
- Copying card images directly to your clipboard
- Sorting cards by name, cost, cmc, type, p/t, color, rarity, or collector number
- Standard, borderless, and frameless art sizes
- Standard, devoid, clear, FNM, and inverted frames
- Easy text-driven modal spells, levelers, sagas, planeswalkers, and spacecraft
- Localization support

## alpha

Card Magician will be entering into alpha testing starting on November 1, 2026. Initial adopters will be encouraged to provide feedback during this time to guide continued work on the project.

If you are interested in this project, please consider [joining the discord](https://discord.gg/abAeJKNhKt).
