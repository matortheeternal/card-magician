import MountedDirectory from './shared/MountedDirectory.js';
import { checkFolderExists, getJoinedPath } from './shared/platformAdapter.js';

describe('Platform', () => {
    let directory;

    beforeAll(async () => {
        directory = new MountedDirectory(appEnvironment.paths.data + '/public',
                                         '/platform-smoke');
        await directory.mount();
    });

    it('keeps Node access outside the renderer', () => {
        expect(typeof window.require).toBe('undefined');
        expect(typeof window.process).toBe('undefined');
    });

    it('rejects unsupported native operations', async () => {
        const result = await window.cardMagicianNative.call('notAnOperation', []);
        expect(result.error.code).toBe('ACCESS_DENIED');
    });

    it('reads installed extensions through files and browser URLs', async () => {
        const extensions = new MountedDirectory(
            appEnvironment.paths.plugins + '/extensions', '/extensions'
        );
        const metadata = await extensions.readJson('games/magic/game.json');
        const response = await fetch(extensions.url('games/magic/game.json'));
        expect(response.ok).toBeTrue();
        expect(await response.json()).toEqual(metadata);
        const script = await fetch(extensions.url('games/magic/main.js'));
        expect(script.status).toBe(200);
        expect(script.headers.get('content-type')).toMatch(/javascript/);
        const categories = ['games', 'cardparts', 'exporters', 'templates', 'locales'];
        for (const category of categories) {
            expect(await extensions.child(category).existsDirectory()).toBeTrue();
            if (appEnvironment.resourceMode === 'bundle') {
                const contentPath = await getJoinedPath(
                    appEnvironment.paths.content, 'extensions', category
                );
                expect(await checkFolderExists(contentPath)).toBeFalse();
            }
        }
    });

    it('serves edited mounted files immediately and handles URL characters', async () => {
        const filename = 'a # b.json';
        await directory.writeText(filename, JSON.stringify({ value: 'first' }));
        expect(await directory.exists(filename)).toBeTrue();
        expect(await directory.readJson(filename)).toEqual({ value: 'first' });
        let response = await fetch(directory.url(filename));
        expect(await response.json()).toEqual({ value: 'first' });
        await directory.writeText(filename, JSON.stringify({ value: 'second' }));
        response = await fetch(directory.url(filename));
        expect(await response.json()).toEqual({ value: 'second' });
        expect(await directory.exists('missing.json')).toBeFalse();
    });

    it('rejects symlinks that escape a mount', async () => {
        if (!appEnvironment.args.includes('--test-symlinks'))
            pending('Symlink fixture requires support without elevation.');
        expect(await directory.exists('escape.txt')).toBeTrue();
        const response = await fetch(directory.url('escape.txt'));
        expect(response.status).toBe(403);
    });
});
