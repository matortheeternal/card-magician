import Localization from './Localization.js';
import {
    createDirectory, getAppDir,
    readDirectory,
    readFile,
    shouldLocalize,
    writeFile
} from './wailsAdapter.js';

const generateSchema = shouldLocalize();
const schemaPromise = loadSchema();
const localesPromise = loadLocales();

let activeLocalization = null;

export async function prepareSchema() {
    Localization.schema = await schemaPromise;
    return Localization.schema;
}

export async function loadLocales() {
    const manifestPath = `locales/locales.json`;
    const manifestStr = await readFile(manifestPath);
    const manifest = JSON.parse(manifestStr);

    const dirEntries = await readDirectory('locales');
    const availableFiles = dirEntries
        .filter(e => e.type === 'FILE' && e.entry.endsWith('.yml'))
        .map(e => e.entry.slice(0, -4));

    return await Promise.all(
        Object.entries(manifest).filter(([key]) => {
            return availableFiles.includes(key);
        }).map(([key, value]) => {
            return Localization.load(key, value);
        })
    );
}

async function saveLocaleRegistry() {
    const locales = (await localesPromise).reduce((acc, locale) => {
        acc[locale.id] = {
            label: locale.label,
            created: locale.created,
            updated: locale.update,
            percentComplete: locale.percentComplete,
            schemaVersion: locale.schemaVersion,
            contributors: locale.contributors
        };
        return acc;
    }, {});
    const text = JSON.stringify(locales, null, 2);
    await writeFile('locales/locales.json', text);
}

export async function getAvailableLocales() {
    return await localesPromise;
}

export async function saveLocale(locale) {
    const locales = await localesPromise;
    locales[locale.id] = locale.metadata;
    saveLocaleRegistry();
    locale.save();
}

export async function setLocalization(localeId) {
    try {
        activeLocalization = await Localization.load(localeId);
        return true;
    } catch (e) {
        console.error('Error loading localization, ', e.message);
        return false;
    }
}

function resolveFallbackStr(strings, values) {
    return strings[0] + values.map((v, i) => {
        return `${v}${strings[i + 1]}`;
    }).join('');
}

function buildLocalizationKey(strings, values) {
    return strings[0] + values.map((v, i) => {
        return `%{${i}}${strings[i + 1]}`;
    }).join('');
}

const writeSchemaFile = (async function writeSchemaFile() {
    const schema = await schemaPromise;
    const json = JSON.stringify(schema, null, 2);
    const outputPath = `locales/schema.json`;
    console.log(`Writing localization schema to `, outputPath);
    await createDirectory('locales').catch(() => {});
    await writeFile(outputPath, json);
}).debounce(1000);

async function updateSchema(namespaceKey, entryKey) {
    const schema = await schemaPromise;
    const namespace = schema[namespaceKey] ||= {};
    namespace[entryKey] ||= 0;
    namespace[entryKey] += 1;
    writeSchemaFile();
}

export async function loadSchema() {
    try {
        const inputPath = `locales/schema.json`;
        const text = await readFile(inputPath);
        return JSON.parse(text);
    } catch (e) {
        console.error(e);
        return {};
    }
}

/**
 * Creates a tagged template function for resolving localized strings within a
 * specific namespace.
 *
 * The returned function generates a stable localization key from the template
 * strings and values, resolves the localized string if available, and falls back
 * to the original template output when no localization exists.
 *
 * Example usage:
 * ```js
 * const L = localize('edit-locales-modal');
 * const title = L`Edit locales`;
 * // yields "Edit locales" by default, but can be localized
 * ```
 *
 * @param {string} namespaceKey
 *   Namespace used to group and resolve localization keys.
 *
 * @returns {(strings: TemplateStringsArray, ...values: any[]) => string}
 *   A tagged template function that returns a localized string.
 */
window.localize = function(namespaceKey) {
    return function(strings, ...values) {
        const key = buildLocalizationKey(strings, values);
        if (generateSchema) updateSchema(namespaceKey, key);
        return activeLocalization?.resolve(namespaceKey, key, values)
            ?? resolveFallbackStr(strings, values);
    };
};
