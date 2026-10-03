import CardMagicianSettings from './CardMagicianSettings.js';

const L = localize('settings');

export default class GitSettings extends CardMagicianSettings {
    static id = 'cm-git-settings';
    static parentId = 'cm-application-settings';
    static label = L`Git`;
    static groupWeight = 0;

    render() {
        this.innerHTML = '';
    }
}
