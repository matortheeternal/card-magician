import { eventually } from '../../../../../../src/shared/testing/testUtils.js';
import { getStoredData } from '../../../../../../src/shared/platformAdapter.js';

describe('Set Icon Editor settings', () => {
    let modal, originalPath;

    beforeEach(async () => {
        const platform = { ...activeGame.platform };
        spyOnProperty(activeGame, 'platform', 'get').and.returnValue(platform);
        originalPath = activeGame.config.get('setIconEditorPath', '');
        await activeGame.config.set('setIconEditorPath', '');
        modal = document.createElement('cm-settings-modal');
        modal.data = { selectedTabId: 'cm-magic-project-details' };
        document.body.append(modal);
        await Promise.all([...modal.querySelectorAll('sl-button')]
            .map(button => button.updateComplete));
    });

    afterEach(async () => {
        modal.remove();
        await activeGame.config.set('setIconEditorPath', originalPath);
    });

    it('navigates to setup and persists a located executable', async () => {
        modal.querySelector('[data-click-action="setupSIE"]').click();
        const settings = modal.querySelector('cm-set-icon-editor-settings');
        expect(settings).not.toBeNull();
        const filename = '/apps/Set Icon Editor/editor.AppImage';
        spyOn(activeGame.platform, 'openSingleFileDialog')
            .and.resolveTo(filename);
        const locate = settings.querySelector('[data-click-action="locate"]');
        await locate.updateComplete;
        locate.click();
        await eventually(() => settings.querySelector('sl-input').value === filename);
        await activeGame.config.flush();
        const stored = JSON.parse(await getStoredData('appConfig-magic'));
        expect(stored.setIconEditorPath).toBe(filename);
        modal.selectNavItem('cm-magic-project-details');
        expect(modal.querySelector('[data-click-action="setupSIE"]')).toBeNull();
        modal.selectNavItem('cm-set-icon-editor-settings');
        const reopened = modal.querySelector('sl-input.editor-path');
        expect(reopened.value).toBe(filename);
        reopened.value = '';
        reopened.dispatchEvent(new CustomEvent('sl-change', { bubbles: true }));
        await eventually(() => {
            return activeGame.config.get('setIconEditorPath') === '';
        });
        modal.selectNavItem('cm-magic-project-details');
        expect(modal.querySelector('[data-click-action="setupSIE"]'))
            .not.toBeNull();
    });

    it('handles picker cancellation and the download link', async () => {
        modal.selectNavItem('cm-set-icon-editor-settings');
        const settings = modal.querySelector('cm-set-icon-editor-settings');
        spyOn(activeGame.platform, 'openSingleFileDialog').and.resolveTo(undefined);
        await settings.locate();
        expect(activeGame.config.get('setIconEditorPath')).toBe('');
        spyOn(activeGame.platform, 'openUrl').and.resolveTo();
        settings.querySelector('[data-click-action="download"]').click();
        expect(activeGame.platform.openUrl).toHaveBeenCalledWith(
            'https://github.com/matortheeternal/set-icon-editor/releases/latest'
        );
    });

    it('launches the configured editor with the project symbol', async () => {
        await activeGame.config.set('setIconEditorPath', '/apps/editor');
        const project = new activeGame.Project();
        spyOnProperty(project, 'symbolPath', 'get').and.returnValue('/sets/icon.svg');
        spyOn(activeGame.platform, 'openSvgEditor').and.resolveTo();
        await project.editSetSymbol();
        expect(activeGame.platform.openSvgEditor)
            .toHaveBeenCalledWith('/apps/editor', '/sets/icon.svg');
        activeGame.platform.openSvgEditor.and.rejectWith(
            new Error('Missing executable')
        );
        spyOn(window.dialog, 'alert').and.resolveTo();
        await project.editSetSymbol();
        expect(window.dialog.alert).toHaveBeenCalledWith(
            jasmine.stringMatching(/Check its path/)
        );
    });
});
