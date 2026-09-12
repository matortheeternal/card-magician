# Proposal ~ Unified Settings

## Motivation

Card Magician's configuration is currently divided among separate modals and menu
items for set information, tags, packs, localization, and exporters. Application
preferences are not yet implemented.

Planned features will add project defaults, keyword reminder text, publishing,
version control, and extension management. Continuing to add a new modal for each
capability would make configuration increasingly difficult to discover and navigate.

Card Magician would benefit from one place where users can find and search available
configuration, while still allowing games and future features to provide their own
settings pages.

## Current behavior

The Edit menu opens separate modals for Set Info, Tags, Packs, and Localization.
Exporter configuration is opened from the Export menu, and the Preferences menu item
is currently a placeholder. See `src/ui/menus/EditMenu.js` and
`src/ui/menus/ExportMenu.js`.

These configuration surfaces use different models and persistence mechanisms. Some
settings are stored in the project, tags are stored in a separate file, and application
configuration is stored outside the project. The existing field and form systems are
shared by several of these surfaces, but there is no shared navigation or discovery
system for them.

## Proposed solution

Add a unified Settings modal containing searchable, hierarchical navigation and a
content area for the selected settings page.

The modal will include project configuration, application preferences, and extension
management. Likely pages include Set Info, Defaults, Tags, Packs, Publishing,
Exporters, Version Control, General Preferences, Localization, and Extensions. This
organization is illustrative rather than prescriptive. Project and application
settings should be visually distinguishable where the difference is meaningful, but
they do not need separate dialogs.

Settings pages will use autosave. Each page will remain responsible for updating the
appropriate project, application, or external state. Actions such as installing an
extension or interacting with version control may take effect immediately rather than
behaving like ordinary form fields.

Core features and games will be able to register settings pages using conventions
similar to the application's existing modal and component systems. The exact API and
implementation details will be decided during development.

Search will help users find both settings pages and individual controls. The exact
indexing strategy is not part of this proposal.

Existing feature-specific menu items may continue to open the Settings modal to the
relevant page. Features can be migrated incrementally.

Installed and Discover views will eventually allow users to browse and manage
games, templates, exporters, and other supported extension types.

### Standards

WebStorm presents global and project-specific settings in one searchable dialog. It
uses hierarchical navigation, visually marks project-specific settings, and includes
plugin management as a top-level destination. Its Plugins page combines extension
discovery and Installed views.

This approach provides one discoverable configuration surface without requiring every
page to use the same persistence or behavior. Card Magician can use the same broad
model while keeping its implementation appropriate to its smaller and simpler
architecture.

#### Magic Set Editor

Magic Set Editor exposes set information, styling, keywords, packs, and application
preferences through several task-specific views and dialogs. This gives individual
features dedicated space, but does not provide one searchable configuration surface.

Its distinction between set content and application preferences remains useful. Card
Magician should preserve that distinction visually and behaviorally even when both are
available from one modal.

### Risks and tradeoffs

- *What security considerations are there for this solution?*
  - A community extension directory introduces the existing security concerns
    associated with installing executable extensions. A centralized registry and
    review process can help users make informed decisions about what they install.
- *What user pain does this solution solve?*
  - Users gain one predictable place to find project settings, application preferences,
    exporters, publishing tools, and installed extensions.
  - Search reduces the need to understand how features are divided across menus.
- *What user pain could this solution create?*
  - Combining project and application settings could make the scope of a change less
    clear.
  - A large number of pages could make the modal feel dense or difficult to navigate.
- *What maintenance burdens could this solution introduce?*
  - The settings navigation and search systems will become shared infrastructure that
    must accommodate configuration supplied by core features and games.
  - Extension discovery and management will add substantial functionality within the
    modal.
- *How does the solution balance simplicity and functionality?*
  - A single settings surface reduces duplicated navigation and modal behavior. Reusing
    existing components and allowing pages to own their behavior avoids forcing all
    configuration into one complex system.

## Alternative solutions

### Separate project, application, and extension settings

Each scope could have its own modal or workspace. This would make scope immediately
clear and allow each surface to evolve independently. It would also fragment discovery
and search, duplicate navigation, and make capabilities that cross scopes harder to
understand.

### Continue using feature-specific modals

Each feature could retain or add its own modal and menu item. This is the smallest
short-term approach and gives each feature complete control over its UI. It does not
scale well to the number of planned configuration features and provides no consistent
extension point or search experience.

## Open questions

### Should all settings share one modal?

Does combining project settings, application preferences, and extension management
make configuration easier to discover, or would separate surfaces be clearer?

### How should scope be communicated?

What visual affordances would make it clear whether a setting affects the current
project or the application?

### Does extension management belong in Settings?

Will Installed and Discover views fit naturally in this modal, or are they likely to
need a dedicated workspace?

### What should settings search include?

Should search return only pages, or should it also navigate directly to sections and
individual controls?
