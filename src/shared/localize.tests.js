import MountedDirectory from './MountedDirectory.js';
import platform from './platformAdapter.js';
import { loadLocaleDirectory } from './localize.js';

describe('Locale discovery', () => {
    let directory;

    beforeAll(async () => {
        directory = new MountedDirectory(
            appEnvironment.paths.data + '/locale-discovery', '/locale-discovery'
        );
        try { await platform.rmrf(directory.filePath); } catch {}
        await platform.createDirectory(directory.filePath);
        await directory.writeText('locales.json', JSON.stringify({
            listed: { label: 'Listed locale' },
            missing: { label: 'Locale without a file' }
        }));
        await directory.writeText('listed.yml', '{}');
        await directory.writeText('unlisted.yml', '{}');
    });

    afterAll(async () => {
        await platform.rmrf(directory.filePath);
    });

    it('lists manifest locales that have a translation file', async () => {
        const locales = await loadLocaleDirectory(directory);
        expect(locales.map(locale => locale.id)).toEqual(['listed']);
        expect(locales[0].label).toBe('Listed locale');
        expect(locales[0].directory).toBe(directory);
    });

    it('lists nothing without a manifest', async () => {
        const empty = directory.child('empty');
        await platform.createDirectory(empty.filePath);
        expect(await loadLocaleDirectory(empty)).toEqual([]);
    });
});
