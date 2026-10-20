import CardMagicianSettings from './CardMagicianSettings.js';
import { registerSettings } from './settingsRegistry.js';

const L = localize('settings');

export default class PublishingSettings extends CardMagicianSettings {
    static id = 'cm-publishing-settings';
    static parentId = 'cm-application-settings';
    static label = L`Publishing`;
    static groupWeight = 2;

    render() {
        this.innerHTML = 'Coming soon.';
    }
}

registerSettings(PublishingSettings);
