import { watchFile, watchTextFile, clear } from './fileWatcher.js';
import platform from './platformAdapter.js';

async function eventually(check) {
    for (let attempt = 0; attempt < 150; attempt++) {
        if (check()) return;
        await new Promise(resolve => { setTimeout(resolve, 20); });
    }
    throw new Error('Timed out waiting for a file event');
}

const pause = () => new Promise(resolve => { setTimeout(resolve, 700); });

describe('File watcher', () => {
    let folder;

    beforeEach(async () => {
        folder = await platform.getJoinedPath(appEnvironment.paths.data, crypto.randomUUID());
        await platform.createDirectory(folder);
    });

    afterEach(async () => {
        clear();
        await platform.rmrf(folder);
    });

    it('delivers changes and deletion until unsubscribed', async () => {
        const filename = await platform.getJoinedPath(folder, 'watched.txt');
        const events = [];
        const stop = await watchFile(filename, event => events.push(event));
        await platform.writeFile(filename, 'first');
        await eventually(() => events.length === 1);
        expect(events[0]).toEqual({ type: 'change', path: filename });
        await platform.writeFile(filename, 'second');
        await eventually(() => events.length === 2);
        await platform.rmrf(filename);
        await eventually(() => events.length === 3);
        expect(events[2].type).toBe('delete');
        await stop();
        await platform.writeFile(filename, 'after unsubscribe');
        await pause();
        expect(events.length).toBe(3);
    });

    it('clears all watches and accepts new watches in the next context', async () => {
        const first = await platform.getJoinedPath(folder, 'first.txt');
        const second = await platform.getJoinedPath(folder, 'second.txt');
        const previous = jasmine.createSpy('previous context');
        await watchFile(first, previous);
        await watchFile(second, previous);
        clear();
        const current = jasmine.createSpy('current context');
        await watchFile(second, current);
        await platform.writeFile(first, 'ignored');
        await platform.writeFile(second, 'current');
        await eventually(() => current.calls.count() === 1);
        expect(previous).not.toHaveBeenCalled();
    });

    it('closes pending subscriptions when the context changes', async () => {
        const filename = await platform.getJoinedPath(folder, 'pending.txt');
        const callback = jasmine.createSpy('pending callback');
        const ready = watchFile(filename, callback);
        clear();
        await ready;
        await platform.writeFile(filename, 'ignored');
        await pause();
        expect(callback).not.toHaveBeenCalled();
    });

    it('discards an in-flight text read after the context changes', async () => {
        const filename = await platform.getJoinedPath(folder, 'slow.txt');
        let finish;
        const reading = new Promise(resolve => { finish = resolve; });
        const read = spyOn(platform, 'readFile').and.returnValue(reading);
        const apply = jasmine.createSpy('apply text');
        const watching = watchTextFile(filename, apply, { initial: true });
        await eventually(() => read.calls.count() === 1);
        clear();
        finish('stale text');
        await watching;
        expect(apply).not.toHaveBeenCalled();
    });
});
