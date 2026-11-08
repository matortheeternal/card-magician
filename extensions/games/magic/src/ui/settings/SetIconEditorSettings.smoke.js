describe('Set Icon Editor settings', () => {
    let modal, originalPath, originalTab;

    async function selectTab(id) {
        const item = modal.querySelector(`[data-tab-id="${id}"]`);
        const ancestors = [];
        let parent = item.parentElement;
        while (parent.tagName === 'SL-TREE-ITEM') {
            ancestors.unshift(parent);
            parent = parent.parentElement;
        }
        for (const ancestor of ancestors) {
            await ancestor.updateComplete;
            if (!ancestor.expanded) {
                await cmTest.click(
                    ancestor.shadowRoot.querySelector('[part="expand-button"]')
                );
                await cmTest.eventually(() => ancestor.expanded);
            }
        }
        await item.updateComplete;
        await cmTest.click(item.shadowRoot.querySelector('[part="label"]'));
        return cmTest.eventually(() => modal.querySelector(id));
    }

    beforeEach(async () => {
        modal = null;
        const platform = Object.create(activeGame.platform);
        spyOnProperty(activeGame, 'platform', 'get').and.returnValue(platform);
        originalPath = activeGame.config.get('setIconEditorPath', '');
        originalTab = activeGame.config.get('lastSettingsTab');
        await activeGame.config.set('setIconEditorPath', '');
        modal = await cmTest.openSettings();
        await selectTab('cm-magic-project-details');
        await Promise.all([...modal.querySelectorAll('sl-button')]
            .map(button => button.updateComplete));
    });

    afterEach(async () => {
        await cmTest.closeSettings();
        await activeGame.config.set('setIconEditorPath', originalPath);
        await activeGame.config.set('lastSettingsTab', originalTab);
    });

    it('navigates to setup and persists a located executable', async () => {
        await cmTest.click(modal.querySelector('[data-click-action="setupSIE"]'));
        const settings = await cmTest.eventually(() =>
            modal.querySelector('cm-set-icon-editor-settings'));
        expect(settings).not.toBeNull();
        const filename = '/apps/Set Icon Editor/editor.AppImage';
        spyOn(activeGame.platform, 'openSingleFileDialog')
            .and.resolveTo(filename);
        const locate = settings.querySelector('[data-click-action="locate"]');
        await cmTest.click(locate);
        await cmTest.eventually(
            () => settings.querySelector('sl-input').value === filename
        );
        await activeGame.config.flush();
        const stored = JSON.parse(
            await activeGame.platform.getStoredData('appConfig-magic')
        );
        expect(stored.setIconEditorPath).toBe(filename);
        await selectTab('cm-magic-project-details');
        expect(modal.querySelector('[data-click-action="setupSIE"]')).toBeNull();
        await selectTab('cm-set-icon-editor-settings');
        const reopened = modal.querySelector('sl-input.editor-path');
        expect(reopened.value).toBe(filename);
        await reopened.updateComplete;
        await cmTest.click(reopened.shadowRoot.querySelector('[part="clear-button"]'));
        await cmTest.eventually(() => {
            return activeGame.config.get('setIconEditorPath') === '';
        });
        await selectTab('cm-magic-project-details');
        expect(modal.querySelector('[data-click-action="setupSIE"]'))
            .not.toBeNull();
    });

    it('handles picker cancellation and the download link', async () => {
        await selectTab('cm-set-icon-editor-settings');
        const settings = modal.querySelector('cm-set-icon-editor-settings');
        spyOn(activeGame.platform, 'openSingleFileDialog').and.resolveTo(undefined);
        await cmTest.click(settings.querySelector('[data-click-action="locate"]'));
        await cmTest.eventually(
            () => activeGame.platform.openSingleFileDialog.calls.count() === 1
        );
        expect(activeGame.config.get('setIconEditorPath')).toBe('');
        spyOn(activeGame.platform, 'openUrl').and.resolveTo();
        await cmTest.click(settings.querySelector('[data-click-action="download"]'));
        expect(activeGame.platform.openUrl).toHaveBeenCalledWith(
            'https://github.com/matortheeternal/set-icon-editor/releases/latest'
        );
    });

    it('launches the configured editor with the project symbol', async () => {
        await activeGame.config.set('setIconEditorPath', '/apps/editor');
        spyOnProperty(activeProject, 'symbolPath', 'get')
            .and.returnValue('/sets/icon.svg');
        spyOn(activeGame.platform, 'openSvgEditor').and.resolveTo();
        await cmTest.click(
            modal.querySelector('cm-edit-set-symbol [data-click-action="edit"]')
        );
        await cmTest.eventually(
            () => activeGame.platform.openSvgEditor.calls.count() === 1
        );
        expect(activeGame.platform.openSvgEditor)
            .toHaveBeenCalledWith('/apps/editor', '/sets/icon.svg');
        activeGame.platform.openSvgEditor.and.rejectWith(
            new Error('Missing executable')
        );
        spyOn(window.dialog, 'alert').and.resolveTo();
        await cmTest.click(
            modal.querySelector('cm-edit-set-symbol [data-click-action="edit"]')
        );
        await cmTest.eventually(() => window.dialog.alert.calls.count() === 1);
        expect(window.dialog.alert).toHaveBeenCalledWith(
            jasmine.stringMatching(/Check its path/)
        );
    });
});
