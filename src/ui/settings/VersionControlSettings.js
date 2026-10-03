import CardMagicianSettings from './CardMagicianSettings.js';

const L = localize('settings');

export default class VersionControlSettings extends CardMagicianSettings {
    static id = 'cm-version-control-settings';
    static parentId = 'cm-application-settings';
    static label = L`Version Control`;
    static groupWeight = 0;

    render() {
        this.innerHTML = '';
    }
}
