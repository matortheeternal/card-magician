import yaml from 'yaml';

const GENERATE_SCHEMA = NL_ARGS.includes("--localize");
const LOCALE_DIR = 'locales';

let activeLocalization = null;
let schema = GENERATE_SCHEMA ? new Map() : null;

class Localization {
    static async load(localeId) {
        const filePath = `${LOCALE_DIR}/${localeId}.yml`;
        const yamlStr = await Neutralino.filesystem.readFile(filePath);
        const data = yaml.parse(yamlStr);

        return new Localization(localeId, data);
    }

    constructor(localeId, data) {
        this.localeId = localeId;
        this.data = data;
    }

    resolve(namespaceKey, key, values) {
        const namespace = this.data[namespaceKey];
        const template = namespace?.[key];
        if (!template) return null;
        return template.replace(/%\{(\d+)}/g, (_, index) => {
            return values[index];
        });
    }
}

async function getAvailableLocales() {
    const manifestPath = `${LOCALE_DIR}/locales.json`;
    const manifestStr = await Neutralino.filesystem.readFile(manifestPath);
    const manifest = JSON.parse(manifestStr);

    return await Neutralino.filesystem.readDirectory(LOCALE_DIR)
        .filter(e => e.type === 'FILE' && e.entry.endsWith('.yml'))
        .map(e => {
            const id = e.entry.slice(0, -4);
            const meta = manifest[localeId] || {};
            const label = meta.label ?? localeId;
            const updated = meta.updated ?? null;
            const percentComplete = meta.percentComplete ?? null;
            return { id, label, updated, percentComplete };
        });
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

const writeSchemaFile = (function writeSchemaFile() {
    const out = {};

    for (const [namespace, map] of schema.entries()) {
        out[namespace] = {};
        for (const [key, meta] of map.entries())
            out[namespace][key] = meta;
    }

    const json = JSON.stringify(out, null, 2);
    const outputPath = `${LOCALE_DIR}/schema.json`;
    console.log(`Writing localization schema to `, outputPath);
    Neutralino.filesystem.writeFile(outputPath, json);
}).debounce(1000);

function updateSchema(namespaceKey, entryKey, strings, values) {
    if (!schema.has(namespaceKey))
        schema.set(namespaceKey, new Map());

    const namespace = schema.get(namespaceKey);
    namespace.set(entryKey, (namespace.get(entryKey) || 0) + 1);
    writeSchemaFile();
}

window.localize = function(namespaceKey) {
    return function(strings, ...values) {
        const key = buildLocalizationKey(strings, values);
        if (GENERATE_SCHEMA) updateSchema(namespaceKey, key, strings, values);
        return activeLocalization?.resolve(namespaceKey, key, values)
            ?? resolveFallbackStr(strings, values);
    };
}
