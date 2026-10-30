const L = localize('game-magic');

export default class MagicSettings extends CardMagicianSettings {
    static id = 'cm-magic-settings';
    static parentId = null;
    static label = L`Magic`;
    static groupWeight = 256;

    static search() {
        return [];
    }

    render() {
        this.innerHTML = (
            `<cm-settings-toc></cm-settings-toc>`
        );
    }
}
