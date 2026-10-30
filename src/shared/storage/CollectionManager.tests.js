import CollectionManager from './CollectionManager.js';
import YAMLSerializer from '../../domain/projects/serializers/YAMLSerializer.js';

describe('CollectionManager', () => {
    let manager;
    let options;
    let save;
    let load;
    let stats;

    beforeEach(() => {
        jasmine.clock().install();
        options = {
            path: jasmine.createSpy('path').and.returnValue(['data', 'items.yml']),
            matches: (item, value) => item.name === value,
            create: jasmine.createSpy('create').and.callFake(name => ({ name })),
            next: jasmine.createSpy('next').and.callFake(n => `Item ${n}`),
        };
        spyOn(Neutralino.filesystem, 'getJoinedPath')
            .and.callFake(async (...parts) => parts.join('/'));
        stats = spyOn(Neutralino.filesystem, 'getStats').and.resolveTo({ isFile: true });
        load = spyOn(YAMLSerializer, 'load').and.resolveTo([{ name: 'loaded' }]);
        save = spyOn(YAMLSerializer, 'save').and.resolveTo();
        manager = new CollectionManager(options);
    });

    afterEach(async () => {
        await manager.flush().catch(() => undefined);
        jasmine.clock().uninstall();
    });

    it('requires loading or assigning the collection before accessing it', () => {
        expect(() => manager.collection)
            .toThrowError('Collection has not been loaded yet.');
        manager.collection = [];
        expect(manager.collection).toEqual([]);
    });

    it('loads existing items from the resolved YAML path', async () => {
        await manager.load();
        expect(stats).toHaveBeenCalledOnceWith('data/items.yml');
        expect(load).toHaveBeenCalledOnceWith('data/items.yml');
        expect(manager.collection).toEqual([{ name: 'loaded' }]);
        expect(save).not.toHaveBeenCalled();
    });

    it('starts an empty collection when the file is missing', async () => {
        stats.and.rejectWith({ code: 'NE_FS_NOPATHE' });
        await manager.load();
        expect(manager.collection).toEqual([]);
        expect(load).not.toHaveBeenCalled();
        expect(save).not.toHaveBeenCalled();
    });

    it('propagates file access errors without discarding existing items', async () => {
        manager.collection = [{ name: 'unsaved' }];
        const error = new Error('Access denied');
        stats.and.rejectWith(error);
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
        expect(options.create).toHaveBeenCalledOnceWith('custom');
        expect(manager.collection[0]).toBe(item);
        expect(options.next).not.toHaveBeenCalled();
        await manager.flush();
        expect(save).toHaveBeenCalledOnceWith('data/items.yml', [item]);
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
        expect(save).toHaveBeenCalledOnceWith('data/items.yml', [item]);
    });

    it('removes only the first matching item and saves the remainder', async () => {
        const second = { name: 'same', id: 2 };
        const other = { name: 'other' };
        manager.collection = [{ name: 'same', id: 1 }, other, second];
        manager.removeFirst('same');
        expect(manager.collection).toEqual([other, second]);
        expect(manager.collection[1]).toBe(second);
        await manager.flush();
        expect(save).toHaveBeenCalledOnceWith('data/items.yml', [other, second]);
    });

    it('does not save when removeFirst finds no match', async () => {
        manager.collection = [{ name: 'keep' }];
        manager.removeFirst('missing');
        await manager.flush();
        expect(manager.collection).toEqual([{ name: 'keep' }]);
        expect(save).not.toHaveBeenCalled();
    });

    it('removes all matching items and saves the remainder', async () => {
        manager.collection = [{ name: 'same' }, { name: 'keep' }, { name: 'same' }];
        manager.removeAll('same');
        expect(manager.collection).toEqual([{ name: 'keep' }]);
        await manager.flush();
        expect(save).toHaveBeenCalledOnceWith('data/items.yml', [{ name: 'keep' }]);
    });

    it('debounces edits for the default delay and saves the latest state', async () => {
        manager.collection = [];
        manager.create('first');
        jasmine.clock().tick(2000);
        manager.create('second');
        const pending = manager.save();
        jasmine.clock().tick(2999);
        await Promise.resolve();
        expect(save).not.toHaveBeenCalled();
        jasmine.clock().tick(1);
        await pending;
        expect(save).toHaveBeenCalledOnceWith('data/items.yml', [
            { name: 'first' }, { name: 'second' },
        ]);
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
        expect(save).toHaveBeenCalledOnceWith('data/items.yml', []);
    });

    it('flushes pending direct edits immediately using the current path', async () => {
        manager.collection = [{ name: 'before' }];
        manager.scheduleSave();
        manager.collection[0].name = 'after';
        options.path.and.returnValue(['other', 'items.yml']);
        await manager.flush();
        expect(save).toHaveBeenCalledOnceWith('other/items.yml', [{ name: 'after' }]);
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
