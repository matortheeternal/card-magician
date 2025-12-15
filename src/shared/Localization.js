import yaml from 'yaml';
import { escapeHTML } from './htmlUtils.js';
import { generateLocaleTemplate } from './localize.js';

export default class Localization {
    static async load(localeId, metadata) {
        const filePath = `locales/${localeId}.yml`;
        const yamlStr = await Neutralino.filesystem.readFile(filePath);
        const data = yaml.parse(yamlStr);

        return new Localization(localeId, data, metadata);
    }

    static async generate(localeId) {
        const data = await generateLocaleTemplate();
        return new Localization(localeId, data);
    }

    constructor(localeId, data, metadata = {}) {
        this.id = localeId;
        this.data = data;
        this.label = metadata?.label || 'New Locale';
        this.created = metadata?.created || new Date();
        this.updated = metadata?.updated || undefined;
        this.name = `${this.label} (${this.id}.yml)`;
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
}
