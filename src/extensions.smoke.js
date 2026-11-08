import { readExtensionDirectories, findExtension } from './shared/extensionManager.js';
import { getAvailableLocales } from './shared/localize.js';
import platform from './shared/platformAdapter.js';
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
        const expectedPath = await platform.getJoinedPath(
            appEnvironment.paths.data, '..', 'extensions'
        );
        expect(appEnvironment.paths.extensions).toBe(expectedPath);
    });

    it('loads games and cardparts from the configured root', () => {
        expect(activeGame.gamePath).toBe('extensions/games/magic');
        const face = activeEditorCard.front;
        const templateField = face.fields.find(field => field.id === 'template');
        const option = templateField.options.find(
            option => option.id === 'magic/M15/Main'
        );
        expect(option.name).toBe('User extension smoke template');
        const indicator = face.modules.find(module => {
            return module.modulePath === 'magic/M15/ColorIndicator';
        });
        expect(indicator.directory.url())
            .toBe('/extensions/cardparts/magic/M15/ColorIndicator');
        const text = face.modules.find(
            module => module.modulePath === 'magic/M15/Text'
        );
        expect(text.directory.url()).toBe('/extensions/cardparts/magic/M15/Text');
    });

    it('discovers games within the configured root', async () => {
        const games = await readExtensionDirectories('games');
        expect(games.filter(game => game.url().endsWith('/magic')).length).toBe(1);
        const userGame = games.find(game => {
            return game.url() === '/extensions/games/magic';
        });
        expect(userGame).toBeDefined();
    });

    it('imports user JavaScript and resolves its cardpart assets', async () => {
        const mainPath = '/extensions/user-only.js';
        const module = await import(mainPath);
        expect(module.default).toBe('user extension');
        const indicator = activeEditorCard.front.modules.find(module => {
            return module.modulePath === 'magic/M15/ColorIndicator';
        });
        const imageUrl = indicator.resolveAsset('indicator/a.png');
        expect(imageUrl).toContain('/extensions/');
        const response = await fetch(imageUrl);
        expect(response.ok).toBeTrue();
        const image = await createImageBitmap(await response.blob());
        expect(image.width).toBeGreaterThan(0);
        image.close();
    });

    it('does not fall back to extensions in the development checkout', async () => {
        await expectAsync(findExtension('exporters/TTSDeckExporter'))
            .toBeRejectedWithError('Extension not found: exporters/TTSDeckExporter');
        const response = await fetch('/extensions/exporters/TTSDeckExporter/main.js');
        expect(response.status).toBe(404);
        const mounts = await platform.getMounts();
        expect(Object.hasOwn(mounts, '/user-extensions')).toBeFalse();
    });

    it('loads user locales listed in their manifest', async () => {
        const locales = await getAvailableLocales();
        const locale = locales.find(locale => locale.id === 'smoke');
        expect(locale.label).toBe('User extension smoke locale');
        expect(locale.directory.url()).toBe('/extensions/locales');
    });

    it('runs the user exporter and writes its output to disk', async () => {
        await setCardFields({ name: 'User extension export' });
        await flushCard();
        activeProject.export.WebExporter = {};
        await executeAction('run-exporter', 'WebExporter');
        const outputPath = await platform.getJoinedPath(
            activeProject.folderPath,
            'dist', 'user-web', 'set.json'
        );
        const output = JSON.parse(await platform.readFile(outputPath));
        expect(output.cards[0].front.name).toBe('User extension export');
        document.querySelector('cm-progress-modal')?.remove();
    });
});
