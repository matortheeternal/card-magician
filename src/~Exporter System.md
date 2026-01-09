# Proposal ~ Exporter System

## Motivation
Users want to be able to export sets produced in the software to various distinct 
artifacts. Below is a non-exhaustive list of artifacts that should be supported:

- **Individual Card Images** - The primary, default export. This form is often 
  required/consumed by other exporters.
- **Printable PDF** - A common use case for printing cards to be played in paper. A 
  lot of users use third party printing services that may have distinct requirements, 
  however. 
- **Printable Card Sheets** - These are what are used in industrial applications. They 
  likely are not needed for initial consumer adoption. That said, the implementation 
  of the exporting system may use these as an intermediate format for performance reasons.
- **MSE Set** - For interoperability with Magic Set Editor.
- **JSON/Web** - For presentation and sharing purposes, similar to EggHub. The exact 
  details of the implementation for a web portal to explore a collection of custom 
  sets will be elaborated on in a separate proposal.
- **Tabletop Simulator Object** - For use with Tabletop Simulator.
- **Cockatrice** - For use with Cockatrice.
- **Lackey** - For use with Lackey. Lower priority because Lackey isn't used as much 
  in the custom magic community (to my knowledge).

## Current behavior
Card Magician currently has an option to export a single card's card image, can 
save sets as JSON.

## Proposed solution
A module system similar to the card part module system, located in an `exporters` 
folder. Exporters would extend a base class `CardMagicianExporter`.

Importers will be located in a separate `importers` folder and will be detailed in a 
separate proposal.

Users will have the ability to configure multiple "Build targets" per project, each of 
which will use a distinct exporter. Then they will be able to build specific targets 
or build all targets from the UI. Building all targets at once will allow us to reuse 
card image artifacts, which should reduce the total build time required when dealing 
with large sets and multiple export artifacts.

### Standards
This is a good candidate for a plugin ecosystem. Similar to how software can be 
extended to support different languages, Card Magician needs to be extendable to be 
able to support different export artifacts.

#### Magic Set Editor
Magic Set Editor has the ability to:

- Export single card images
- Export all or a subset of card images from a set
- Print a set
- Export to Magic Workstation
- Export to Apprentice
- Export as "HTML"

The Export as HTML option has been extended by modules to export arbitrary format for 
use with third party programs, and exporters currently exist for:

- EggHub - a static site generator that uses python scripts to generate HTML files 
  which are usually hosted through GitHub pages.
- Cockatrice
- PlaneSculptors
- FieldTest
- LackeyBot
- Name Check
- SymbolPrinter
- Text
- Simple Exporter
- Skeleton
- XML
- Forum
- Forum Booster
- TappedOut
- Lackey
- MWS
- Wagic
- Spoiler

Some of these exporters may not be used consistently by the Custom Magic community. 
Exporters which see consistent used should be prioritized.

### Risks and tradeoffs
- *What security considerations are there for this solution?*
  - There are major security implications for any plugins. Developing a perfect 
    sandbox is impossible. That said, exporters don't need to have filesystem access 
    necessarily, they could be passed and return interfaces that can then be invoked 
    to read/write files from disk, and the paths for these operations can be cleaned 
    and validated. Beyond this, having a centralized plugin registry is one of the 
    most valuable things we can do to help protect users. A centralized registry can 
    have review processes that capture malicious code before it gets published. The 
    manpower requirement is notable, but I think it is unavoidable.
- *What user pain does this solution solve?*
  - Users want to be able to export and play their sets through various software or in 
    paper. By providing a streamlined and flexible export system, we set the community 
    and users up for success.
- *What user pain could this solution create?*
  - Broken, out-of-date, or undocumented exporters could waste time and create annoyance.
    It could be smart to have tests/QA set up per exporter so we can quickly and 
    effectively identify deprecated or non-functional implementations and appropriately 
    flag them as deprecated. It may also be good to set up a dashboard to quickly assess 
    the "health" of all exporter modules, potentially by checking for news and updates 
    from the software they target, and checking against "last tested with" metadata.
- *What maintenance burdens could this solution introduce?*
  - This solution largely avoids maintenance burden by splitting exporter modules off 
    from the main codebase. Early stage inclusion of them in this monorepo may be 
    performed to reduce the burden of managing multiple repositories, with them 
    spinning off to separate and distinct repositories as needed at a future point in 
    time. This allows us to have our cake and eat it too.
- *How does the solution balance simplicity and functionality?*
  - We already have several similar module systems in Card Magician. Reusing the same 
    patterns should result in a relatively low increase in complexity while offering 
    extremely powerful functionality to future developers and real time-saving value to 
    end-users.

## Alternative solutions

### Native exporters
This would basically mean having exporters be part of the core codebase instead of 
having them be plugins. The key advantage this offers is increased security and 
standardization. The key disadvantages are higher barriers to contribution, and increased
management, coordination, and maintenance burden for the core Card Magician development 
team.

At a surface level, the space of possible exporters seems more bounded than the space 
of games, templates, and card part modules. However, the reality is that new targets 
are always being created. Having exporters be community plugins distributes maintenance
burden and empowers the community to build and maintain solutions.

## Open questions

### What exporters do you think are most important?
Are there exporters that aren't supported by MSE or mentioned in this document that you 
would like to see?

### Is everything about this system clear?
Does any part of the system need additional detail or elaboration to be properly 
assessed?

### How do you feel about the build target concept?
It is maybe slightly more technical-sounding, but the real world benefits seem pretty 
big. Being able to export a set for multiple pieces of software at the same time could 
be of great value to set authors who are active and prolific.

### Thoughts on security/extensibility/manpower tradeoffs?
Having a registry for modules will introduce a manpower requirement, but it is 
necessary to maintain extensibility and security. The alternative of packaging 
exporters with the software loses us extensibility and accessibility, while keeping 
many of the same issues as having a plugin ecosystem. Do you have any insights or 
strong opinions about how we can execute this not just for exporters, but for other 
plugins that are already part of the Card Magician architecture at scale?

### Is separating importers OK?
I think many of our target ecosystems aren't going to have importers, and implementing 
importers for them could be unnecessarily difficult. Importing card images or documents, 
for example, would require OCR unless the files have embedded metadata. Separating 
importers seem appropriate, and importing is sufficiently different to have distinct 
technical and API requirements. Does this choice seem reasonable?
