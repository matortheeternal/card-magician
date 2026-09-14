import CardMagicianSettings from './CardMagicianSettings.js';
import { registerSettings } from './settingsRegistry.js';

const L = localize('settings');

export default class ApplicationSettings extends CardMagicianSettings {
    static id = 'cm-application-settings';
    static label = L`Application`;
    static groupWeight = 768;

    static async search(query) {
        return [];
    }

    render() {
        this.innerHTML = (
            `<cm-settings-toc></cm-settings-toc>`
        );
    }
}

registerSettings(ApplicationSettings);
