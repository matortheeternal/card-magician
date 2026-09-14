import CardMagicianSettings from './CardMagicianSettings.js';
import { registerSettings } from './settingsRegistry.js';

const L = localize('settings');

export default class ExtensionSettings extends CardMagicianSettings {
    static id = 'cm-extension-settings';
    static label = L`Extensions`;
    static groupWeight = 512;

    static async search(query) {
        return [];
    }

    render() {
        this.innerHTML = (
            `<cm-settings-toc></cm-settings-toc>`
        );
    }
}

registerSettings(ExtensionSettings);
