# Proposal ~ Design Skeleton

## Motivation
Explicit structure defining card distribution can be useful when designing large sets of
cards to ensure proper balance and match conventions.

## Current behavior
The project currently has no concept of or capabilities involving design skeletons.

## Proposed solution
Introduce a persistent Design Skeleton that exists alongside a set and describes an 
expected card distribution. The skeleton is opt-in and non-destructive.

### Skeleton slots
A skeleton is an ordered list of slots. Each slot may define:
- Color identity
- Rarity
- Other constraints (e.g., card type or mana value range)
- Optional semantic metadata for use in generation (e.g., tags or notes)

### Generation
A UI action will be provided to generate cards based on the set's skeleton. Generated 
cards are marked with `generatedBy: 'skeleton'`. This flag is cleared by the user editing
a card. Regeneration is only able to change or delete cards with this flag, so cards that 
have been modified or created by the user are never modified or deleted.

### Slots
Skeleton slots reference cards in the set. If a skeleton is added to a set that already 
has cards in it, the system will assign matching cards to slots within that skeleton. A 
tab will be added to the program called "Skeleton" which will display all skeleton slots 
and the cards assigned to those slots and allow users to assign and unassign cards from
slots. Slots can hold a single card, and cards can be assigned to a single slot.

Users will be able to create and modify skeleton slots from the skeleton view.

The Skeleton view will also provide a system for producing a summary report on the number 
of unfilled skeleton slots, for quick structural validation of custom sets.

### Skeleton templates
The system will allow users to create and share skeleton templates. A skeleton template 
will define a set of skeleton slots and may optionally define additional slots for
specific size variants (e.g. 360 card skeleton, 250 card skeleton). Users will be 
able to export their current set skeleton as a shareable .cm-skeleton file.

### Standards
Most software treats generators as a first step. This system is unique in how it treats 
a design skeleton as both a generation and a validation surface.

#### Magic Set Editor
Magic Set Editor provides fixed skeleton buttons that generate predefined card 
distributions. These skeletons are not customizable.

### Risks and tradeoffs
- *What security considerations are there for this solution?*
  - A skeleton template is another possible attack surface. Any implementation should 
    mitigate both ReDOS and ACE attack vectors.
- *What user pain does this solution solve?*
  - By making the template configurable, it empowers users to more closely incorporate 
    structural conventions into their set design processes.
- *What user pain could this solution create?*
  - Because the system is optional, users can simply opt out of using it if it is not 
    serving their workflow. The main consideration should be intuitiveness and avoiding 
    busy work as much as possible, so users don't end up trapped in low-value loops.
- *What maintenance burdens could this solution introduce?*
  - The UI surface area is the largest maintenance burden. State changes and bugs related 
    to generation are another potential future cost.
- *How does the solution balance simplicity and functionality?*
  - The system is designed to provide the most complete skeleton functionality the custom 
    card community has ever seen, and so is therefore naturally more complex than what 
    has existed before. However, it is being designed this way in direct response to 
    explicit feature requests by users. It will be sophisticated, but this sophistication 
    is warranted for the value it will deliver.

## Alternative solutions

### Numeric-only generator
Provide a simple color × rarity count table that generates blank cards without 
persistence or validation.
- Much simpler to implement.
- Does not support iteration or evaluation.

### Hardcoded MtG skeletons
Ship a fixed set of MtG-specific skeletons similar to MSE.
- Low design overhead.
- Inflexible, opaque, and not easily extensible to other games.

## Open questions

### Invalidation?
Should there be automatic invalidation of card assignment to skeleton slots if key 
metadata changes (color, rarity, type)?

### Skeleton profiles?
Are skeleton profiles a good idea as opposed to just having more skeletons?

### Is the proposed system overengineered?
Do you think this system as designed will be truly useful to users, or is it overly 
complicated in a way that would be more of a hinderance than a useful tool?
