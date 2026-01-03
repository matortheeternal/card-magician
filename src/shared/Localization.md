# Localization

## Design
The localization system present in `Localization.js` and `localize.js` is built with
the goal of providing a simple system which is easy to use inline with UI code for
localizing strings.

The provided API is used simply:
```js
const L = localize('namespace-here');
L`A string to translate`;
```

The system is built on the following key decisions:

- Template strings and template string formatter functions are a logical extension
  for localization. They support substitution out of the box for the most complex
  localization use cases, and they can naturally be incredibly succinct in code. In
  this case, only a single character is needed to make a string localized in context.
- Localization keys are the base English text to be localized. This provides several
  advantages
  - There is no need to come up with a key to describe the string. You just stick `L`
    in front of it and you're done.
  - The code looks identical to what will be rendered when the default English locale
    is used. This is in line with the codebase's treatment as English as the language
    of development.
  - When translating, a translator can see the string they are translating and the
    translation side-by-side. This makes detecting and correcting mistakes or
    inconsistencies easy.
- Dynamic values are parametrized in localization keys as %{#}, with # being the index
  of the value. This syntax was chosen to be distinct from JS template syntax to make
  it clear it is a separate syntax that is handled differently.

Note: Localization is resolved on-demand when the tagged template function is invoked.
This means changing localization requires re-rendering the component for strings to
update. The intended implementation associated with changing localization is reloading
the entire application.

## Namespaces
To localize a file, you invoke the localize function and pass a namespace key. The
namespace key you use here should be based on the component or file the localization
is associated with. The namespace key will correspond to a section in the
localization YAML named after the key.

Namespace keys are expected to be stable over time, as they form part of the
localization key space.

## Localization files
Localization files are stored on disk as YAML files, with the .yml extension. This
format was chosen due to its easier human readability compared to alternatives like
JSON.

Metadata on available localizations is stored in the `locales.json` file. Each
localization is represented as an object keyed by its id. A given localization entry
in this file will have a label, a list of contributors, the date it was created, the
date it was last updated, the schema version that was used to build it, and a
percentage indicating how complete it is.

The individual locale translation files are named after their id, e.g. fr.yml would be
for French. The IDs of translations should generally correspond to their ISO 639
language code.

## Localization schema
The localization function can also be used to capture and build a base localization
template or "schema" file. This base schema file is then utilized when generating a
new localization file to create blank entries for each possible localization key.
An updated schema file can be generated using the `--localize` command-line parameter.
This should always be run prior to release, so users and translators always have an
updated schema.json in their local environment.

## Blank entry handling
When a localization is not active or a localization key is not present, the system
falls back to the default base English value for display. This is simple and does not
require any additional localization files to be loaded or queried.

## See also
- [editLocalesModal](../ui/modals/editLocalesModal/editLocalesModal.md)
