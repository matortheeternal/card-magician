import platform from '../platformAdapter.js';
import CollectionManager from './CollectionManager.js';
import ImageFieldValue from '../../domain/card/ImageFieldValue.js';
import { getImageSize } from '../imageUtils.js';
import YAMLSerializer from '../../domain/projects/serializers/YAMLSerializer.js';

describe('CollectionManager', () => {
    let manager;
    let status;
    let options;
    let save;
    let load;
    let fileExists;

    beforeEach(() => {
        jasmine.clock().install();
        status = jasmine.createSpy('set-status');
        spyOn(window.actions, 'get').and.callThrough()
            .withArgs('set-status').and.returnValue(status);
        options = {
            path: jasmine.createSpy('path').and.returnValue(['data', 'items.yml']),
            matches: (item, value) => item.name === value,
            create: jasmine.createSpy('create').and.callFake(name => ({ name })),
            next: jasmine.createSpy('next').and.callFake(n => `Item ${n}`),
        };
        spyOn(platform, 'getJoinedPath')
            .and.callFake(async (...parts) => parts.join('/'));
        fileExists = spyOn(platform, 'checkFileExists').and.resolveTo(true);
        load = spyOn(YAMLSerializer, 'load').and.resolveTo([{ name: 'loaded' }]);
        save = spyOn(YAMLSerializer, 'save').and.resolveTo();
        manager = new CollectionManager(options);
    });

    afterEach(async () => {
        save.and.resolveTo();
        await manager.flush().catch(() => undefined);
        jasmine.clock().uninstall();
    });

    it('round trips nested images with embedded bytes', async () => {
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="18"/>';
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const image = new ImageFieldValue(url, 12, 18);
        image.crop.width = 10;
        image.crop.height = 15;
        image.crop.xOffset = 2;
        image.dirty = true;
        let yaml;
        spyOn(platform, 'getPathParts')
            .and.resolveTo({ parentPath: 'data' });
        spyOn(platform, 'createDirectory').and.resolveTo();
        const write = spyOn(platform, 'writeFile')
            .and.callFake(async (path, text) => { yaml = text; });
        spyOn(platform, 'readFile').and.callFake(async () => yaml);
        save.and.callThrough();
        load.and.callThrough();
        try {
            manager.collection = [{ name: 'Symbol', front: { image } }];
            manager.scheduleSave();
            await manager.flush();
            expect(write.calls.count()).toBe(1);
            expect(yaml).toContain('data:image/svg+xml;base64,');
            expect(yaml).not.toContain('blob:');
            expect(yaml).not.toContain('dirty:');
            expect(manager.collection[0].id).toBeUndefined();
            URL.revokeObjectURL(url);
            await manager.load();
            const restored = manager.collection[0].front.image;
            expect(restored instanceof ImageFieldValue).toBeTrue();
            expect(restored.crop).toEqual(image.crop);
            expect(await getImageSize(restored.imageUrl))
                .toEqual({ width: 12, height: 18 });
            expect(new Uint8Array(await restored.loadImageData()))
                .toEqual(new Uint8Array(await blob.arrayBuffer()));
            const fetchImage = spyOn(window, 'fetch').and.callThrough();
            manager.collection[0].name = 'Renamed';
            manager.scheduleSave();
            await manager.flush();
            expect(fetchImage).not.toHaveBeenCalled();
            expect(yaml).toContain('Renamed');
            restored.imageUrl = null;
            manager.scheduleSave();
            await manager.flush();
            await manager.load();
            expect(manager.collection[0].front.image.imageUrl).toBeNull();
            expect(yaml).not.toContain('base64,');
        } finally {
            URL.revokeObjectURL(url);
        }
    });

    it('keeps normal YAML image serialization as metadata only', async () => {
        const image = new ImageFieldValue('blob:unavailable', 12, 18);
        const serializer = new YAMLSerializer();
        const yaml = await serializer.serialize({ image });
        expect(yaml).not.toContain('imageUrl:');
        expect(yaml).toContain('width: 12');
    });

    it('propagates image embedding failures without writing partial YAML', async () => {
        save.and.callThrough();
        const write = spyOn(platform, 'writeFile').and.resolveTo();
        spyOn(window, 'fetch').and.rejectWith(new Error('Image unavailable'));
        manager.collection = [{ image: new ImageFieldValue('blob:unavailable') }];
        const pending = manager.save();
        const rejected = expectAsync(pending).toBeRejectedWithError('Image unavailable');
        await expectAsync(manager.flush()).toBeRejectedWithError('Image unavailable');
        await rejected;
        expect(write).not.toHaveBeenCalled();
    });

    it('requires loading or assigning the collection before accessing it', () => {
        expect(() => manager.collection)
            .toThrowError('Collection has not been loaded yet.');
        manager.collection = [];
        expect(manager.collection).toEqual([]);
    });

    it('loads existing items from the resolved YAML path', async () => {
        await manager.load();
        expect(fileExists).toHaveBeenCalledOnceWith('data/items.yml');
        expect(load).toHaveBeenCalledOnceWith('data/items.yml');
        expect(manager.collection).toEqual([{ name: 'loaded' }]);
        expect(save).not.toHaveBeenCalled();
    });

    it('starts an empty collection when the file is missing', async () => {
        fileExists.and.resolveTo(false);
        await manager.load();
        expect(manager.collection).toEqual([]);
        expect(load).not.toHaveBeenCalled();
        expect(save).not.toHaveBeenCalled();
    });

    it('propagates file access errors without discarding existing items', async () => {
        manager.collection = [{ name: 'unsaved' }];
        const error = new Error('Access denied');
        fileExists.and.rejectWith(error);
        await expectAsync(manager.load()).toBeRejectedWith(error);
        expect(manager.collection).toEqual([{ name: 'unsaved' }]);
        expect(load).not.toHaveBeenCalled();
    });

    it('propagates YAML loading failures', async () => {
        const error = new Error('Invalid YAML');
        load.and.rejectWith(error);
        await expectAsync(manager.load()).toBeRejectedWith(error);
        expect(() => manager.collection).toThrow();
    });

    it('returns the first matching item or undefined', () => {
        const first = { name: 'same' };
        manager.collection = [first, { name: 'same' }];
        expect(manager.find('same')).toBe(first);
        expect(manager.find('missing')).toBeUndefined();
    });

    it('generates the first unused value without inserting or saving an item', () => {
        manager.collection = [{ name: 'Item 1' }, { name: 'Item 2' }];
        expect(manager.getNextValue()).toBe('Item 3');
        expect(options.next.calls.allArgs()).toEqual([[1], [2], [3]]);
        expect(manager.collection.length).toBe(2);
        expect(options.create).not.toHaveBeenCalled();
        expect(save).not.toHaveBeenCalled();
    });

    it('restarts candidate generation at one on each call', () => {
        manager.collection = [];
        expect(manager.getNextValue()).toBe('Item 1');
        expect(manager.getNextValue()).toBe('Item 1');
        expect(options.next.calls.allArgs()).toEqual([[1], [1]]);
    });

    it('creates, appends, and saves an item from an explicit value', async () => {
        manager.collection = [];
        const item = manager.create('custom');
        expect(status.calls.allArgs()).toEqual([['changes']]);
        expect(options.create).toHaveBeenCalledOnceWith('custom');
        expect(manager.collection[0]).toBe(item);
        expect(options.next).not.toHaveBeenCalled();
        await manager.flush();
        expect(save).toHaveBeenCalledOnceWith(
            'data/items.yml', [item], { embedImages: true }
        );
        expect(status.calls.allArgs()).toEqual([['changes'], ['saving'], ['saved']]);
    });

    for (const value of [undefined, null]) {
        it(`generates an unused value when create receives ${value}`, () => {
            manager.collection = [{ name: 'Item 1' }];
            expect(manager.create(value)).toEqual({ name: 'Item 2' });
            expect(options.create).toHaveBeenCalledOnceWith('Item 2');
        });
    }

    for (const value of ['', 0, false]) {
        it(`preserves the explicit falsy creation value ${JSON.stringify(value)}`, () => {
            manager.collection = [];
            expect(manager.create(value)).toEqual({ name: value });
            expect(options.next).not.toHaveBeenCalled();
        });
    }

    it('reuses a matching item without creating or scheduling a save', async () => {
        const item = { name: 'existing' };
        manager.collection = [item];
        expect(manager.findOrCreate('existing')).toBe(item);
        await manager.flush();
        expect(options.create).not.toHaveBeenCalled();
        expect(save).not.toHaveBeenCalled();
    });

    it('creates an item when findOrCreate has no match', async () => {
        manager.collection = [];
        const item = manager.findOrCreate('new');
        expect(manager.collection).toEqual([item]);
        expect(options.create).toHaveBeenCalledOnceWith('new');
        await manager.flush();
        expect(save).toHaveBeenCalledOnceWith(
            'data/items.yml', [item], { embedImages: true }
        );
    });

    it('removes only the item and saves the remainder', async () => {
        const second = { name: 'same', id: 2 };
        const other = { name: 'other' };
        manager.collection = [{ name: 'same', id: 1 }, other, second];
        manager.remove(manager.collection[0]);
        expect(manager.collection).toEqual([other, second]);
        expect(manager.collection[1]).toBe(second);
        await manager.flush();
        expect(save).toHaveBeenCalledOnceWith(
            'data/items.yml', [other, second], { embedImages: true }
        );
    });

    it('does not save when remove finds no match', async () => {
        manager.collection = [{ name: 'keep' }];
        manager.remove({ name: 'missing' });
        await manager.flush();
        expect(manager.collection).toEqual([{ name: 'keep' }]);
        expect(save).not.toHaveBeenCalled();
    });

    it('removes all matching items and saves the remainder', async () => {
        manager.collection = [{ name: 'same' }, { name: 'keep' }, { name: 'same' }];
        manager.removeAll('same');
        expect(manager.collection).toEqual([{ name: 'keep' }]);
        await manager.flush();
        expect(save).toHaveBeenCalledOnceWith(
            'data/items.yml', [{ name: 'keep' }], { embedImages: true }
        );
    });

    it('debounces edits for the default delay and saves the latest state', async () => {
        manager.collection = [];
        manager.create('first');
        jasmine.clock().tick(500);
        manager.create('second');
        const pending = manager.save();
        jasmine.clock().tick(999);
        await Promise.resolve();
        expect(save).not.toHaveBeenCalled();
        jasmine.clock().tick(1);
        await pending;
        expect(save).toHaveBeenCalledOnceWith(
            'data/items.yml',
            [
                { name: 'first' },
                { name: 'second' },
            ],
            { embedImages: true }
        );
    });

    it('honors the configured save delay', async () => {
        options.saveDelay = 50;
        manager = new CollectionManager(options);
        manager.collection = [];
        const pending = manager.save();
        jasmine.clock().tick(49);
        await Promise.resolve();
        expect(save).not.toHaveBeenCalled();
        jasmine.clock().tick(1);
        await pending;
        expect(save).toHaveBeenCalledOnceWith(
            'data/items.yml', [], { embedImages: true }
        );
    });

    it('flushes pending direct edits immediately using the current path', async () => {
        manager.collection = [{ name: 'before' }];
        manager.scheduleSave();
        manager.collection[0].name = 'after';
        options.path.and.returnValue(['other', 'items.yml']);
        await manager.flush();
        expect(save).toHaveBeenCalledOnceWith(
            'other/items.yml', [{ name: 'after' }], { embedImages: true }
        );
        await manager.flush();
        expect(save.calls.count()).toBe(1);
    });

    it('propagates save failures and permits a later save to succeed', async () => {
        manager.collection = [];
        const error = new Error('Disk full');
        save.and.rejectWith(error);
        const pending = manager.save();
        const rejected = expectAsync(pending).toBeRejectedWith(error);
        await expectAsync(manager.flush()).toBeRejectedWith(error);
        await rejected;
        save.and.resolveTo();
        manager.scheduleSave();
        await manager.flush();
        expect(save.calls.count()).toBe(2);
    });
});
