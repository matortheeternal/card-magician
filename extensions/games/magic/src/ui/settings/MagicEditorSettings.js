const L = localize('game-magic');

const editorSettings = [
    { id: 'highlightUnrecognizedRules', label: L`Underline unrecognized rules text` },
    { id: 'suggestOracleTags', label: L`Suggest card tags` }
];

export default class MagicEditorSettings extends CardMagicianSettings {
    static id = 'cm-magic-editor-settings';
    static parentId = 'cm-magic-settings';
    static label = L`Editor`;
    static groupWeight = 1024;

    static search(query) {
        return editorSettings.filter(field => this.fieldMatches(field, query));
    }

    get model() {
        return activeGame.config;
    }

    bind() {
        this.on('sl-change', event => this.changeSetting(event.target));
    }

    changeSetting(control) {
        const setting = editorSettings.find(({ id }) => id === control.dataset.setting);
        if (!setting) return;
        return this.model.set(setting.id, control.checked);
    }

    renderSetting({ id, label }) {
        const checked = this.model.get(id) ? 'checked' : '';
        return `<sl-switch data-setting="${id}" ${checked}>${label}</sl-switch>`;
    }

    render() {
        const controls = editorSettings
            .map(setting => this.renderSetting(setting)).join('');
        this.innerHTML = `
            <p class="text-muted">${L`These preferences apply across Magic projects.`}</p>
            <div class="field-group">${controls}</div>`;
    }
}
