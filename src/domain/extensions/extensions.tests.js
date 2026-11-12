import {
    CardPartExtension, GameExtension, isSafeExtensionPath
} from './extensionClasses.js';
import platform from '../../shared/platformAdapter.js';

describe('Extension packages', () => {
    function createExtension(version = '0.2.0') {
        return new CardPartExtension('package/cardparts/magic/Text/module.json', {
            id: 'magic/Text', version
        });
    }

    function compareVersions(left, right) {
        const extension = createExtension(left);
        extension.installedVersion = right;
        return extension.versionDifference;
    }

    it('rejects malformed versions rather than extracting embedded numbers', () => {
        const versions = [
            'release1.2.3', '1.2.3.4', '1.2.3-beta..1', '1.2.3-01', '01.2.3'
        ];
        for (const version of versions)
            expect(() => createExtension(version)).withContext(version).toThrow();
    });

    it('compares numeric components and treats missing components as zero', () => {
        expect(compareVersions('0.10', '0.2.0')).toBe(1);
        expect(compareVersions('1.0', '1.0.0')).toBe(0);
        expect(compareVersions('1.9.9', '2.0.0')).toBe(-1);
        expect(compareVersions('1.0+build.1', '1.0+build.2')).toBe(0);
    });

    it('orders prerelease versions before releases and compares identifiers', () => {
        expect(compareVersions('1.0.0-beta.2', '1.0.0-beta.11')).toBe(-1);
        expect(compareVersions('1.0.0-beta', '1.0.0')).toBe(-1);
        expect(compareVersions('1.0.0', '1.0.0-beta')).toBe(1);
        expect(compareVersions('1.0.0-beta', '1.0.0-beta.1')).toBe(-1);
        expect(() => compareVersions('invalid', '1.0')).toThrow();
    });

    it('models new, upgrade, installed, and outdated extensions', () => {
        const extension = createExtension();
        expect(extension.isNew).toBeTrue();
        expect(extension.canInstall).toBeTrue();
        extension.installedVersion = '0.1';
        expect(extension.isNew).toBeFalse();
        expect(extension.canInstall).toBeTrue();
        extension.installedVersion = '0.2';
        expect(extension.canInstall).toBeFalse();
        expect(extension.isOutdated).toBeFalse();
        extension.installedVersion = '0.3';
        expect(extension.canInstall).toBeFalse();
        expect(extension.isOutdated).toBeTrue();
    });

    it('rejects paths that can escape the extension directory', () => {
        const unsafePaths = [
            '../escape', '/absolute', 'C:/file', 'a/../b',
            'a\\b', 'a//b', 'a/./b', '', undefined
        ];
        for (const path of unsafePaths)
            expect(isSafeExtensionPath(path)).withContext(String(path)).toBeFalse();
        expect(isSafeExtensionPath('magic/M15/Text')).toBeTrue();
    });

    it('recognizes standalone metadata and validates IDs', async () => {
        expect(GameExtension.matches('game.json')).toBeTrue();
        expect(GameExtension.matches('not-game.json')).toBeFalse();
        await expectAsync(GameExtension.load('game.json', {
            json: async () => ({ id: '../escape', version: '1.0' })
        })).toBeRejected();
    });

    it('preserves hierarchical IDs and limits files to the extension folder', () => {
        const extension = createExtension();
        expect(extension.relativePath).toBe('cardparts/magic/Text');
        expect(extension.contains('package/cardparts/magic/Text/main.js')).toBeTrue();
        const outsidePath = 'package/cardparts/magic/TextOther/main.js';
        expect(extension.contains(outsidePath)).toBeFalse();
        expect(() => extension.addEntry(
            'package/cardparts/magic/Text/../escape', {}
        )).toThrow();
    });

    it('writes assets before metadata to the configured root', async () => {
        const extension = createExtension();
        const entry = { arrayBuffer: async () => new ArrayBuffer(2) };
        extension.addEntry('package/cardparts/magic/Text/module.json', entry);
        extension.addEntry('package/cardparts/magic/Text/assets/image.png', entry);
        spyOn(platform, 'checkFileExists').and.resolveTo(false);
        spyOn(platform, 'getParentPath').and.callFake(async path => {
            return path.slice(0, path.lastIndexOf('/'));
        });
        spyOn(platform, 'createDirectory').and.resolveTo();
        const write = spyOn(platform, 'writeBinaryFile').and.resolveTo();
        await extension.install();
        const root = appEnvironment.paths.extensions + '/cardparts/magic/Text';
        expect(write.calls.allArgs().map(args => args[0])).toEqual([
            root + '/assets/image.png', root + '/module.json'
        ]);
        expect(extension.installedVersion).toBe('0.2.0');
    });

    it('rechecks installed versions before overwriting', async () => {
        const extension = createExtension();
        spyOn(platform, 'checkFileExists').and.resolveTo(true);
        spyOn(platform, 'readFile').and.resolveTo(JSON.stringify({
            id: 'magic/Text', version: '0.3.0'
        }));
        const write = spyOn(platform, 'writeBinaryFile');
        await extension.install();
        expect(write).not.toHaveBeenCalled();
        expect(extension.isOutdated).toBeTrue();
    });

    it('keeps the old version when copying an asset fails', async () => {
        const extension = createExtension();
        extension.installedVersion = '0.1.0';
        extension.addEntry('package/cardparts/magic/Text/main.js', {
            arrayBuffer: async () => { throw new Error('Corrupt asset'); }
        });
        spyOn(platform, 'checkFileExists').and.resolveTo(true);
        spyOn(platform, 'readFile').and.resolveTo(JSON.stringify({
            id: 'magic/Text', version: '0.1.0'
        }));
        spyOn(platform, 'getParentPath').and.resolveTo('/unused');
        spyOn(platform, 'createDirectory').and.resolveTo();
        const write = spyOn(platform, 'writeBinaryFile');
        await expectAsync(extension.install()).toBeRejectedWithError('Corrupt asset');
        expect(write).not.toHaveBeenCalled();
        expect(extension.installedVersion).toBe('0.1.0');
    });
});
