import { readExtensionDirectories } from './shared/extensionManager.js';
import { getAvailableLocales } from './shared/localize.js';
import { getJoinedPath, readFile } from './shared/platformAdapter.js';
import {
    createCard, createTestProject, deleteTestProject, flushCard, setCardFields
} from './shared/testing/testUtils.js';
import { executeAction } from './ui/systems/actionSystem.js';

describe('Extensions', () => {
    beforeEach(async () => {
        await createTestProject();
        await createCard();
    });

    afterAll(async () => { await deleteTestProject(); });

    it('uses the configured Electron profile for user extensions', async () => {
        const expectedPath = await getJoinedPath(
            appEnvironment.paths.data, '..', 'extensions'
        );
        expect(appEnvironment.paths.userExtensions).toBe(expectedPath);
    });

    it('loads user extensions alongside distributed cardparts', () => {
        expect(activeGame.gamePath).toBe('user-extensions/games/magic');
        const face = activeEditorCard.front;
        const templateField = document.querySelector(
            'cm-face-form[data-face-id="front"] cm-template-field');
        expect(templateField.options.find(option => option.id === 'magic/M15/Main').name)
            .toBe('User extension smoke template');
        const indicator = face.modules.find(module => {
            return module.modulePath === 'magic/M15/ColorIndicator';
        });
        expect(indicator.directory.url())
            .toBe('/user-extensions/cardparts/magic/M15/ColorIndicator');
        const text = face.modules.find(module => module.modulePath === 'magic/M15/Text');
        expect(text.directory.url()).toBe('/extensions/cardparts/magic/M15/Text');
    });

    it('discovers a matching extension only once', async () => {
        const games = await readExtensionDirectories('games');
        expect(games.filter(game => game.url().endsWith('/magic')).length).toBe(1);
        const userGame = games.find(game => {
            return game.url() === '/user-extensions/games/magic';
        });
        expect(userGame).toBeDefined();
    });

    it('imports user JavaScript and resolves its cardpart assets', async () => {
        const mainPath = '/user-extensions/user-only.js';
        const module = await import(mainPath);
        expect(module.default).toBe('user extension');
        const indicator = activeEditorCard.front.modules.find(module => {
            return module.modulePath === 'magic/M15/ColorIndicator';
        });
        const imageUrl = indicator.resolveAsset('indicator/a.png');
        expect(imageUrl).toContain('/user-extensions/');
        const response = await fetch(imageUrl);
        expect(response.ok).toBeTrue();
        const image = await createImageBitmap(await response.blob());
        expect(image.width).toBeGreaterThan(0);
        image.close();
    });

    it('keeps the two mounts separate', async () => {
        const installed = await fetch('/extensions/user-only.js');
        expect(installed.status).toBe(404);
        const user = await fetch('/user-extensions/cardparts/magic/M15/Text/main.js');
        expect(user.status).toBe(404);
    });

    it('loads user locales listed in their manifest', async () => {
        const locales = await getAvailableLocales();
        const locale = locales.find(locale => locale.id === 'smoke');
        expect(locale.label).toBe('User extension smoke locale');
        expect(locale.directory.url()).toBe('/user-extensions/locales');
    });

    it('runs the user exporter and writes its output to disk', async () => {
        await setCardFields({ name: 'User extension export' });
        await flushCard();
        activeProject.export.WebExporter = {};
        await executeAction('run-exporter', 'WebExporter');
        const outputPath = await getJoinedPath(activeProject.folderPath,
                                               'dist', 'user-web', 'set.json');
        const output = JSON.parse(await readFile(outputPath));
        expect(output.cards[0].front.name).toBe('User extension export');
        document.querySelector('cm-progress-modal')?.remove();
    });
});
