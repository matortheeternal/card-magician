import PendingWork from './PendingWork.js';

function deferred() {
    let resolve;
    const promise = new Promise(r => { resolve = r; });
    return { promise, resolve };
}

describe('PendingWork', () => {
    it('is idle once every tracked promise has settled', async () => {
        const work = new PendingWork();
        const task = deferred();
        work.track(task.promise);
        expect(work.isIdle).toBeFalse();
        task.resolve();
        await work.settled();
        expect(work.isIdle).toBeTrue();
    });

    it('waits for work tracked while it is settling', async () => {
        const work = new PendingWork();
        const first = deferred();
        const second = deferred();
        let secondDone = false;
        work.track(first.promise.then(() => {
            work.track(second.promise.then(() => { secondDone = true; }));
        }));
        const settled = work.settled();
        first.resolve();
        await Promise.resolve();
        second.resolve();
        await settled;
        expect(secondDone).toBeTrue();
    });
});
