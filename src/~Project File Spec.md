# Project & Asset Architecture

## Design Goals

- Favor simplicity, browseability, and low user friction
- Ensure projects are self-contained and portable
- Make project contents understandable via the filesystem alone
- Support version control and safe sharing
- Avoid premature optimization and unnecessary artifacts

## Project Files

### `.cmproj`

- YAML-based project file
- Stores **minimal project metadata**
- Primary responsibility:
    - define project-level settings
    - preserve the **explicit ordering of cards**

Example structure:

```yaml
info:
  name: "My Set"
  author: "Mator"
cards:
  - "Sea Gate Restoration + Sea Gate, Reborn"
  - "Serra Angel"
```

- `.cmproj` does **not** store:
    - card definitions
    - image references
    - binary data
- Cards listed in `.cmproj` correspond to files present in `cards/`

## Directory Structure

```
my-set/
  my-set.cmproj
  cards/
    Card Name.yml
    Card Name.png
    Other Card + Another Card.yml
    Other Card + Another Card - Front.png
    Other Card + Another Card - Back.png
```

- `cards/` is a flat directory
- Filenames are human-readable and derived from card names
- Filenames are sanitized using `sanitize-filename`
- UTF-8 filenames are allowed
- Filenames are stable and meaningful to end users

## Card Files

- Each card is represented by exactly one YAML file: `{Card Name}.yml`
- YAML contains all card data and configuration
- Card YAML filenames are the canonical identifiers used by the project

## Card Naming Rules

- Single-Faced Cards: `{Card Name}`
- Double-Faced Cards: `{Front Card Name} + {Back Card Name}`
- This base name is used consistently for:
  - the card YAML file
  - all associated image assets

## Image Assets

- Original art images are canonical
- Images are held in memory after selection
- Images are written to disk at save time.
- Single-faced card art: `{BaseName}.png`
- Double-faced card art: `{BaseName} - Front.png`, `{BaseName} - Back.png`
- Other assets: `{BaseName} - {Front|Back} {Descriptor}.{ext}`

Examples:
```
Sea Gate Restoration + Sea Gate, Reborn.yml
Sea Gate Restoration + Sea Gate, Reborn - Front.png
Sea Gate Restoration + Sea Gate, Reborn - Back.png
```

## Image Selection & ImageFieldValue Semantics

- `<input type="file">` is used for image selection
- Original filesystem paths are not needed and are not retained

Each image field stores:
- the selected image’s **filename**
- a **session-lifetime ObjectURL** for rendering in the UI

Workflow:
1. User selects an image
2. Image data is loaded into memory
3. An ObjectURL is created for rendering
4. On project save:
    - image data is written to disk
    - filename is derived from the associated card name(s)

## Cropping & Rendering

- Cropping is non-destructive by default
- Crop data is stored in card YAML
- Images are rendered by positioning and scaling the original art

## `.cmset` — Shareable Set Files

`.cmset` is a binary **MessagePack** file Intended for sharing and distribution

### Export Options

When saving as `.cmset`, the following UI options will be provided, including the 
note about image crops.

- [ ] Compress images to reduce file size
- [ ] Crop images to reduce file size
    - Note: when enabled, image crops cannot be adjusted after loading the file

## Explicit Non-Goals

- Referencing external image paths
- Storing temporary or derived image files in the project
- Directory-per-card structures
- Requiring caches or auxiliary artifacts to load a project
- Automatically discovering cards not listed in `.cmproj`

## Invariants

- A project directory is complete and portable
- Opening a project never depends on external filesystem state
- Browsing the `cards/` folder clearly communicates project contents
- File naming mirrors card naming exactly
- Complexity is introduced only when it provides clear user value
