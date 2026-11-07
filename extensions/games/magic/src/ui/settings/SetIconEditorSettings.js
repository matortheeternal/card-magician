const L = localize('game-magic');

export default class SetIconEditorSettings extends CardMagicianSettings {
    static id = 'cm-set-icon-editor-settings';
    static parentId = 'cm-magic-settings';
    static label = L`Set Icon Editor`;
    static groupWeight = 0;

    static search(query) {
        const field = { label: L`Set Icon Editor`, description: L`Executable path` };
        return this.fieldMatches(field, query) ? [field] : [];
    }

    get input() {
        return this.querySelector('.editor-path');
    }

    render() {
        const intro = L([
            'Download and install Set Icon Editor, then click the Locate Set Icon '
            + 'Editor button.'
        ]);
        this.innerHTML = (
            `<p class="text-muted">${intro}</p>
            <sl-input class="editor-path" clearable
                label="${L`Set Icon Editor Path`}">
            </sl-input>
            <p>
                <sl-button data-click-action="download">
                    <sl-icon slot="prefix" name="download"></sl-icon>
                    ${L`Download Set Icon Editor`}
                </sl-button>
                <sl-button data-click-action="locate">
                    <sl-icon slot="prefix" name="folder2-open"></sl-icon>
                    ${L`Locate Set Icon Editor`}
                </sl-button>
            </p>`
        );
        this.querySelector('.editor-path').value
            = activeGame.config.get('setIconEditorPath', '');
    }

    bind() {
        this.input.addEventListener('sl-change', () => this.save());
        this.input.addEventListener('sl-clear', () => this.save());
        this.handleEvents('click', {
            locate: () => this.locate(),
            download: () => activeGame.platform.openUrl(
                'https://github.com/matortheeternal/set-icon-editor/releases/latest'
            )
        });
    }

    async save() {
        const value = this.input.value;
        await activeGame.config.set('setIconEditorPath', value.trim());
    }

    async locate() {
        const filename = await activeGame.platform.openSingleFileDialog(
            L`Locate Set Icon Editor`
        );
        if (!filename) return;
        this.input.value = filename;
        await this.save();
    }
}
