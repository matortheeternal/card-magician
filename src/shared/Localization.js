import yaml from 'yaml';
import { escapeHTML } from './htmlUtils.js';

const CURRENT_SCHEMA_VERSION = 1;

export default class Localization {
    static async load(localeId, metadata = {}) {
        const filePath = `locales/${localeId}.yml`;
        const yamlStr = await Neutralino.filesystem.readFile(filePath);
        const data = yaml.parse(yamlStr);

        return new Localization(localeId, data, metadata);
    }

    static get totalKeys() {
        if (!this.schema) return;
        return Object.values(this.schema).flatMap(entries => {
            return Object.values(entries);
        }).length;
    }

    constructor(localeId, data = {}, metadata = {}) {
        this.id = localeId;
        this.data = data;
        this.label = metadata?.label || 'New Locale';
        this.created = metadata?.created || new Date();
        this.updated = metadata?.updated || undefined;
        this.schemaVersion = metadata?.schemaVersion || CURRENT_SCHEMA_VERSION;
        this.contributors = metadata?.contributors || '';
    }

    resolve(namespaceKey, key, values) {
        const namespace = this.data[namespaceKey];
        const template = namespace?.[key];
        if (!template) return null;
        return escapeHTML(template.replace(/%\{(\d+)}/g, (_, index) => {
            return values[index];
        }));
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

    get raw() {
        return yaml.stringify(this.data);
    }

    set raw(newValue) {
        this.data = yaml.parse(newValue);
        Object.keys(this.data).forEach(namespaceKey => {
            const namespace = this.data[namespaceKey];
            Object.keys(namespace).forEach(key => {
                if (namespace[key] === null)
                    delete namespace[key];
            });
            if (Object.keys(namespace).length === 0)
                delete this.data[namespaceKey];
        });
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

    get edit() {
        if (!this.constructor.schema)
            return this.raw;

        const yamlQuoteExpr = /^[A-Za-z0-9 _.\/]+$/;
        return Object.entries(this.constructor.schema).map(([namespaceKey, entries]) => {
            const namespace = this.data[namespaceKey];
            const contents = Object.keys(entries).map(key => {
                const value = namespace?.[key] || '';
                return yamlQuoteExpr.test(key)
                    ? `    ${key}: ${value}`
                    : `    ${JSON.stringify(key)}: ${value}`;
            }).join('\n');
            return `${namespaceKey}:\n` + contents;
        }).join('\n');
    }

    async save() {
        const filePath = `locales/${this.id}.yml`;
        await Neutralino.filesystem.writeFile(filePath, this.raw);
    }
}
