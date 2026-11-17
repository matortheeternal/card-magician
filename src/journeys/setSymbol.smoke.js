import platform from '../shared/platformAdapter.js';
import { watch } from '../shared/reactivity.js';
import {
    createCard, createTestProject, deleteTestProject, eventually, flushCard,
    setCardFields
} from '../shared/testing/testUtils.js';
import { dismissDialog } from '../shared/testing/steps/dialogs.js';
import { selectSettingsTab } from '../shared/testing/steps/settings.js';

const EDITOR_PATH = '/apps/Set Icon Editor/editor.AppImage';
const DOWNLOAD_URL = 'https://github.com/matortheeternal/set-icon-editor/releases/latest';

function symbol(width) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 100">`
        + '<path fill="black" stroke="white" stroke-width="8" d="M10 10h180v80H10z"/>'
        + '</svg>';
}

function cardSymbolViewBox() {
    const face = document.querySelector('cm-display-card cm-card-face.front');
    const svg = face?.shadowRoot.querySelector('module-container[module="Rarity"] svg');
    return svg?.getAttribute('viewBox');
}

describe('Set symbol', () => {
    let originalPath, originalTab;

    beforeEach(async () => {
        await createTestProject();
        activeProject.symbol = symbol(200);
        await activeProject.saveSymbol();
        const platformStub = Object.create(activeGame.platform);
        spyOnProperty(activeGame, 'platform', 'get').and.returnValue(platformStub);
        originalPath = activeGame.config.get('setIconEditorPath', '');
        originalTab = activeGame.config.get('lastSettingsTab');
        await activeGame.config.set('setIconEditorPath', '');
    });

    afterEach(async () => {
        await cmTest.closeSettings();
        await activeGame.config.set('setIconEditorPath', originalPath);
        await activeGame.config.set('lastSettingsTab', originalTab);
        await deleteTestProject();
    });

    async function locateEditor(modal) {
        await selectSettingsTab(modal, 'cm-magic-project-details');
        await cmTest.click(modal.querySelector('[data-click-action="setupSIE"]'));
        const settings = await eventually(() => {
            return modal.querySelector('cm-set-icon-editor-settings');
        });
        const pick = spyOn(activeGame.platform, 'openSingleFileDialog')
            .and.resolveTo(undefined);
        await cmTest.click(settings.querySelector('[data-click-action="locate"]'));
        await eventually(() => pick.calls.count() === 1);
        expect(activeGame.config.get('setIconEditorPath')).toBe('');

        spyOn(activeGame.platform, 'openUrl').and.resolveTo();
        await cmTest.click(settings.querySelector('[data-click-action="download"]'));
        expect(activeGame.platform.openUrl).toHaveBeenCalledWith(DOWNLOAD_URL);

        pick.and.resolveTo(EDITOR_PATH);
        await cmTest.click(settings.querySelector('[data-click-action="locate"]'));
        await eventually(() => settings.querySelector('sl-input').value === EDITOR_PATH);
        await activeGame.config.flush();
        const stored = JSON.parse(
            await activeGame.platform.getStoredData('appConfig-magic')
        );
        expect(stored.setIconEditorPath).toBe(EDITOR_PATH);
        await selectSettingsTab(modal, 'cm-magic-project-details');
        expect(modal.querySelector('[data-click-action="setupSIE"]')).toBeNull();
    }

    async function editWithExternalEditor(modal, launch, source) {
        launch.and.callFake(async (editor, path) => platform.writeFile(path, source));
        await cmTest.click(
            modal.querySelector('cm-edit-set-symbol [data-click-action="edit"]')
        );
        await eventually(() => activeProject.symbol === source);
    }

    async function editAndKeepLastGoodSymbol(modal, launch) {
        const seen = [];
        const unwatch = watch(activeProject, 'symbol', () => {
            seen.push(activeProject.symbol);
        });
        try {
            await editWithExternalEditor(modal, launch, symbol(100));
            expect(launch).toHaveBeenCalledWith(EDITOR_PATH, activeProject.symbolPath);
            await eventually(() => cardSymbolViewBox() === '0 0 100 100');
            expect(modal.querySelector('cm-edit-set-symbol svg').getAttribute('viewBox'))
                .toBe('0 0 100 100');
            await activeProject.saveSymbol();
            await platform.rmrf(activeProject.symbolPath);
            await platform.writeFile(activeProject.symbolPath, '<svg><broken');
            await editWithExternalEditor(modal, launch, symbol(300));
            expect(seen).toEqual([symbol(100), symbol(300)]);
        } finally {
            unwatch();
        }
    }

    async function reportMissingEditor(modal, launch) {
        launch.and.rejectWith(new Error('Missing executable'));
        await cmTest.click(
            modal.querySelector('cm-edit-set-symbol [data-click-action="edit"]')
        );
        expect(await dismissDialog()).toContain('Check its path');
    }

    async function forgetEditor(modal) {
        const settings = await selectSettingsTab(modal, 'cm-set-icon-editor-settings');
        const input = settings.querySelector('sl-input.editor-path');
        expect(input.value).toBe(EDITOR_PATH);
        await input.updateComplete;
        await cmTest.click(input.shadowRoot.querySelector('[part="clear-button"]'));
        await eventually(() => activeGame.config.get('setIconEditorPath') === '');
        await selectSettingsTab(modal, 'cm-magic-project-details');
        expect(modal.querySelector('[data-click-action="setupSIE"]')).not.toBeNull();
    }

    it('sets up the Set Icon Editor and edits the project symbol with it', async () => {
        await createCard();
        await setCardFields({ rarity: 'rare' });
        await flushCard();
        const modal = await cmTest.openSettings();
        await locateEditor(modal);
        const launch = spyOn(activeGame.platform, 'openSvgEditor');
        await editAndKeepLastGoodSymbol(modal, launch);
        await reportMissingEditor(modal, launch);
        await forgetEditor(modal);
    }, 30000);
});
