# Neutralino adapter
This file serves as a thin adapter layer around the Neutralino window, filesystem, and
operating system functions that are used in this codebase.

## motivation
This adapter exists to reduce friction associated with migrating to other web as
desktop application frameworks in the future such as tauri or electron, should they be
deemed preferable over Neutralino.
