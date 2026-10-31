# Content store

Scripts and locales need writable copies outside the application archive. The
content store seeds these files into the user's profile and tracks the shipped hashes.
On application version changes, it replaces unchanged defaults while preserving
edited and custom files. Increment the application version when updating these defaults.

Plugin folders are loaded directly beside the executable and are not managed here.
Entries for those folders in older manifests are ignored to preserve existing copies.
