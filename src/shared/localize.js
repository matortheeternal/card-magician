import Localization from './Localization.js';

const LOCALE_DIR = 'locales';
const generateSchema = NL_ARGS.includes("--localize");

let activeLocalization = null;
const schemaPromise = loadSchema();

export async function prepareSchema() {
    Localization.schema = await schemaPromise;
    return Localization.schema;
}

export async function getAvailableLocales() {
    const manifestPath = `locales/locales.json`;
    const manifestStr = await Neutralino.filesystem.readFile(manifestPath);
    const manifest = JSON.parse(manifestStr);

    const dirEntries = await Neutralino.filesystem.readDirectory('locales');
    const availableFiles = dirEntries
        .filter(e => e.type === 'FILE' && e.entry.endsWith('.yml'))
        .map(e => e.entry.slice(0, -4));

    return await Promise.all(
        Object.entries(manifest).filter(([key]) => {
            return availableFiles.includes(key);
        }).map(([key, value]) => {
            return Localization.load(key, value)
        })
    );
}

async function setLocalization(localeId) {
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
    const json = JSON.stringify(schema, null, 2);
    const outputPath = `${LOCALE_DIR}/schema.json`;
    console.log(`Writing localization schema to `, outputPath);
    await Neutralino.filesystem.createDirectory(LOCALE_DIR).catch(() => {});
    await Neutralino.filesystem.writeFile(outputPath, json);
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
        const text = await Neutralino.filesystem.readFile(inputPath);
        return JSON.parse(text);
    } catch (e) {
        console.error(e);
        return {};
    }
}

window.localize = function(namespaceKey) {
    return function(strings, ...values) {
        const key = buildLocalizationKey(strings, values);
        if (generateSchema) updateSchema(namespaceKey, key);
        return activeLocalization?.resolve(namespaceKey, key, values)
            ?? resolveFallbackStr(strings, values);
    };
};
