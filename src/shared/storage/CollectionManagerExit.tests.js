import { filesystem } from '../platformAdapter.js';
import CollectionManager from './CollectionManager.js';
import YAMLSerializer from '../../domain/projects/serializers/YAMLSerializer.js';

describe('CollectionManager shutdown saves', () => {
    let manager;
    let save;

    beforeEach(() => {
        jasmine.clock().install();
        spyOn(filesystem, 'getJoinedPath')
            .and.callFake(async (...parts) => parts.join('/'));
        save = spyOn(YAMLSerializer, 'save').and.resolveTo();
        manager = new CollectionManager({ path: () => ['data', 'items.yml'] });
        manager.collection = [];
    });

    afterEach(async () => {
        await manager.flush().catch(() => undefined);
        jasmine.clock().uninstall();
    });

    it('tracks scheduled and running writes until they finish', async () => {
        manager.collection = [];
        expect(manager.pending).toBeFalse();
        let finish;
        save.and.returnValue(new Promise(resolve => { finish = resolve; }));
        manager.scheduleSave();
        expect(manager.pending).toBeTrue();
        const flushed = manager.flush();
        expect(manager.pending).toBeTrue();
        finish();
        await flushed;
        expect(manager.pending).toBeFalse();
    });

    it('keeps failed writes pending and retries them when flushed', async () => {
        manager.collection = [];
        save.and.rejectWith(new Error('Disk full'));
        const pending = manager.save();
        const rejected = expectAsync(pending).toBeRejectedWithError('Disk full');
        await expectAsync(manager.flush()).toBeRejectedWithError('Disk full');
        await rejected;
        expect(manager.pending).toBeTrue();
        save.and.resolveTo();
        await manager.flush();
        expect(save.calls.count()).toBe(2);
        expect(manager.pending).toBeFalse();
    });

    it('flushes edits queued while another save is running', async () => {
        manager.collection = [];
        let finish;
        save.and.returnValues(new Promise(resolve => { finish = resolve; }),
                              Promise.resolve());
        manager.scheduleSave();
        const flushed = manager.flush();
        manager.scheduleSave();
        finish();
        await flushed;
        expect(save.calls.count()).toBe(2);
        expect(manager.pending).toBeFalse();
    });

});
