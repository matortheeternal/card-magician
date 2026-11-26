import SerialCallback from './SerialCallback.js';

function deferred() {
    let resolve;
    const promise = new Promise(r => { resolve = r; });
    return { promise, resolve };
}

describe('SerialCallback', () => {
    it('calls synchronous callbacks immediately every time', () => {
        const calls = [];
        const serial = new SerialCallback(diff => { calls.push(diff.paths); });
        serial.call({ paths: ['a'] });
        serial.call({ paths: ['b'] });
        expect(calls).toEqual([['a'], ['b']]);
    });

    it('combines changes reported while a call runs into one later call', async () => {
        const first = deferred();
        const calls = [];
        const serial = new SerialCallback(diff => {
            calls.push(diff.paths);
            return calls.length === 1 ? first.promise : Promise.resolve();
        });
        const running = serial.call({ paths: ['a'] });
        serial.call({ paths: ['b'] });
        serial.call({ paths: ['c', 'b'] });
        expect(calls).toEqual([['a']]);
        first.resolve();
        await running;
        expect(calls).toEqual([['a'], ['b', 'c']]);
    });

    it('treats a change to every path as covering all queued changes', async () => {
        const first = deferred();
        const calls = [];
        const serial = new SerialCallback(diff => {
            calls.push(diff.paths);
            return calls.length === 1 ? first.promise : Promise.resolve();
        });
        const running = serial.call({ paths: ['a'] });
        serial.call({ paths: ['b'] });
        serial.call({ paths: null });
        first.resolve();
        await running;
        expect(calls).toEqual([['a'], null]);
    });

    it('lets the latest call finish last when an earlier call is slower', async () => {
        const slow = deferred();
        let value;
        const serial = new SerialCallback(async diff => {
            if (diff.paths[0] === 'old') await slow.promise;
            value = diff.paths[0];
        });
        const running = serial.call({ paths: ['old'] });
        serial.call({ paths: ['new'] });
        slow.resolve();
        await running;
        expect(value).toBe('new');
    });
});
