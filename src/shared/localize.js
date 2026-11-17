import { beforeExit } from '../lifecycle.js';
import Localization from './Localization.js';
import { getExtensionDirectory } from './extensionManager.js';

const report = createReporter({ unit: 'localize' });

const generateSchema = appEnvironment.args.includes('--localize');
const schemaPromise = loadSchema();
const localesPromise = loadLocales();

let activeLocalization = null;

export async function prepareSchema() {
    Localization.schema = await schemaPromise;
    return Localization.schema;
}

export async function loadLocaleDirectory(directory) {
    if (!await directory.exists('locales.json')) return [];
    const manifest = await directory.readJson('locales.json');
    const entries = await directory.readDirectory();
    const availableFiles = entries
        .filter(entry => entry.type === 'FILE' && entry.entry.endsWith('.yml'))
        .map(entry => entry.entry.slice(0, -4));
    return Promise.all(Object.entries(manifest)
        .filter(([id]) => availableFiles.includes(id))
        .map(([id, metadata]) => Localization.load(id, metadata, directory)));
}

export async function loadLocales() {
    await prepareSchema();
    return loadLocaleDirectory(getExtensionDirectory().child('locales'));
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
    await getExtensionDirectory().child('locales').writeText('locales.json', text);
}

export async function getAvailableLocales() {
    return localesPromise;
}

export async function saveLocale(locale) {
    try {
        const locales = await localesPromise;
        locales[locale.id] = locale.metadata;
        await saveLocaleRegistry();
        await locale.save();
    } catch (error) {
        report('saveLocale', error, [locale]);
        log('plugin').error('Error saving locale', error.message);
    }
}

export async function setLocalization(localeId) {
    try {
        const locale = (await localesPromise).find(locale => locale.id === localeId);
        activeLocalization = await Localization.load(localeId, {}, locale?.directory);
        return true;
    } catch (e) {
        log('plugin').error('Error loading localization,', e.message);
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
    const directory = getExtensionDirectory().child('locales');
    log('plugin').log('Writing localization schema to', directory.filePath);
    await directory.writeText('schema.json', json);
}).debounce(1000);

beforeExit(() => writeSchemaFile.flush(), () => writeSchemaFile.pending);

async function updateSchema(namespaceKey, entryKey) {
    const schema = await schemaPromise;
    const namespace = schema[namespaceKey] ||= {};
    namespace[entryKey] ||= 0;
    namespace[entryKey] += 1;
    writeSchemaFile();
}

export async function loadSchema() {
    try {
        const directory = getExtensionDirectory().child('locales');
        if (!await directory.exists('schema.json')) return {};
        const text = await directory.readText('schema.json');
        return JSON.parse(text);
    } catch (e) {
        log('plugin').error('Error loading localization schema:', e);
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
