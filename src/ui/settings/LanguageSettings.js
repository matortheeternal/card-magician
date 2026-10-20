import CardMagicianSettings from './CardMagicianSettings.js';
import { registerSettings } from './settingsRegistry.js';

const L = localize('settings');

export default class LanguageSettings extends CardMagicianSettings {
    static id = 'cm-language-settings';
    static parentId = 'cm-language-settings';
    static label = L`Language`;
    static groupWeight = 1;

    render() {
        this.innerHTML = 'Coming soon.';
    }
}

registerSettings(LanguageSettings);
