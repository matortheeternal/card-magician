import CardMagicianSettings from './CardMagicianSettings.js';
import { registerSettings } from './settingsRegistry.js';

const L = localize('settings');

export default class ProjectSettings extends CardMagicianSettings {
    static id = 'cm-project-settings';
    static label = L`Project`;
    static groupWeight = 1024;

    static hide() {
        return true;
    }

    static async search(query) {
        return [];
    }

    render() {
        this.innerHTML = (
            `<cm-settings-toc></cm-settings-toc>`
        );
    }
}

registerSettings(ProjectSettings);
