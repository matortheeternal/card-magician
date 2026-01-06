# Organization
This document addresses the structure of folders and source files in this codebase.
The codebase is organized by responsibility and domain, not by technical role or
framework.

Related files are generally located together. For example, a UI component often has
its JavaScript, CSS, HTML template, tests, and Markdown documentation all together in
a single folder. This is intended to make it easy to discover and fully understand
any particular part of the system.

## domain folder
This folder contains domain-specific business logic which is not closely tied to UI
concerns.

### card subfolder
Code related to handling individual cards.

### game subfolder
Code related to handling game modes and game-associated logic.

### graphics subfolder
Code related to graphical operations on images, generally used by cards.

### sets subfolder
Code related to handling sets of cards.

### template subfolder
Code related to handling card templates.

## shared folder
This folder contains shared utility functions and application logic that is used
across multiple domains or UI systems and does not belong to a specific feature area.

## ui folder
Contains UI components and systems.

### components subfolder
Contains subfolders for reusable components and views.

### modals subfolder
Contains modal components.

### systems subfolder
Contains UI systems that provide systems used by multiple components (e.g. input
handling, global state, or cross-component interactions).

### vendor subfolder
Contains fixes, patches, or shims for third-party code. Code here should be treated as
exceptional and documented accordingly.
