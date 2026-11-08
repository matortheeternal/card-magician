import yaml from 'yaml';
import { escapeHTML } from './htmlUtils.js';
import { getExtensionDirectory } from './extensionManager.js';

const TEMPLATE_PARAMETER_PATTERN = /%\{(\d+)}/g;

const CURRENT_SCHEMA_VERSION = 1;

export default class Localization {
    static async load(localeId, metadata = {}, directory) {
        directory ??= getExtensionDirectory().child('locales');
        const text = await directory.readText(`${localeId}.yml`);
        const locale = new Localization(localeId, text, metadata);
        locale.directory = directory;
        return locale;
    }

    static get totalKeys() {
        if (!this.schema) return null;
        return Object.values(this.schema).flatMap(entries => {
            return Object.values(entries);
        }).length;
    }

    constructor(localeId, text = '', metadata = {}) {
        this.id = localeId;
        this.data = yaml.parse(text) || {};
        this.addMissingKeys();
        this.text = this.stringify();
        this.applyMetadata(metadata);
    }

    applyMetadata(metadata) {
        this.label = metadata?.label || 'New Locale';
        this.created = metadata?.created || new Date();
        this.updated = metadata?.updated || undefined;
        this.schemaVersion = metadata?.schemaVersion || CURRENT_SCHEMA_VERSION;
        this.contributors = metadata?.contributors || '';
    }

    addMissingKeys() {
        const schemaEntries = Object.entries(this.constructor.schema);
        for (const [namespaceKey, entries] of schemaEntries) {
            this.data[namespaceKey] ||= {};
            for (const key in entries)
                this.data[namespaceKey][key] ||= null;
        }
    }

    stringify() {
        return yaml.stringify(this.data, null, { nullStr: '' });
    }

    resolve(namespaceKey, key, values) {
        const namespace = this.data[namespaceKey];
        const template = namespace?.[key];
        if (!template) return null;
        return escapeHTML(template.replace(TEMPLATE_PARAMETER_PATTERN, (_, index) => {
            return values[index];
        }));
    }

    get fields() {
        const L = localize('edit-locales-modal');
        return [
            { id: 'id', label: L`Locale ID` },
            { id: 'label', label: L`Label` },
            { id: 'contributors',
                placeholder: L`Your name here`,
                label: L`Contributors` },
            { id: 'text', label: L`Text`, type: 'code', syntax: 'yaml' }
        ];
    }

    get metadata() {
        return {
            label: this.label,
            created: this.created,
            updated: this.updated,
            percentComplete: this.percentCompleted,
            schemaVersion: this.schemaVersion,
            contributors: this.contributors
        };
    }

    get percentComplete() {
        const ratio = this.completedCount / this.constructor.totalKeys;
        return `${Math.floor(ratio * 100)}%`;
    }

    get completedCount() {
        return Object.values(this.data).flatMap(entries => {
            return Object.values(entries);
        }).length;
    }

    get name() {
        return `${this.label} (${this.id}.yml)`;
    }

    async save() {
        const directory = this.directory
            ?? getExtensionDirectory().child('locales');
        await directory.writeText(`${this.id}.yml`, this.raw);
    }
}
