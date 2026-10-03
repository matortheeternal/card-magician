import CardMagicianSettings from './CardMagicianSettings.js';

const L = localize('settings');

export default class GitSettings extends CardMagicianSettings {
    static id = 'cm-publishing-settings';
    static parentId = 'cm-application-settings';
    static label = L`Publishing`;
    static groupWeight = 2;

    render() {
        this.innerHTML = '';
    }
}
