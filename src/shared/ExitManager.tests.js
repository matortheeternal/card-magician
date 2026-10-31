import ExitManager from './ExitManager.js';

function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
    return { promise, resolve, reject };
}

describe('ExitManager', () => {
    let manager;
    let exit;
    let onError;

    beforeEach(() => {
        exit = jasmine.createSpy('exit').and.resolveTo();
        onError = jasmine.createSpy('onError');
        manager = new ExitManager(exit, onError);
    });

    it('waits for pending saves and shares duplicate exit requests', async () => {
        const save = deferred();
        const flush = jasmine.createSpy('flush').and.returnValue(save.promise);
        manager.beforeExit(flush, () => true);
        const first = manager.exit(7);
        expect(manager.exit()).toBe(first);
        await Promise.resolve();
        expect(exit).not.toHaveBeenCalled();
        save.resolve();
        await first;
        expect(flush).toHaveBeenCalledTimes(1);
        expect(exit).toHaveBeenCalledOnceWith(7);

    });

    it('keeps the app open on save failure and allows another exit attempt', async () => {
        const error = new Error('Disk full');
        const flush = jasmine.createSpy('flush').and.rejectWith(error);
        manager.beforeExit(flush, () => true);
        await expectAsync(manager.exit()).toBeRejectedWith(error);
        expect(exit).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledOnceWith(error);
        flush.and.resolveTo();
        await manager.exit();
        expect(exit).toHaveBeenCalledOnceWith(0);
    });

    it('starts all hooks and waits for all of them even when one fails', async () => {
        const remaining = deferred();
        const error = new Error('Failed');
        manager.beforeExit(() => { throw error; });
        manager.beforeExit(() => remaining.promise);
        let finished = false;
        const result = manager.exit().catch(value => { finished = true; return value; });
        await Promise.resolve();
        await Promise.resolve();
        expect(finished).toBeFalse();
        remaining.resolve();
        expect(await result).toBe(error);
        expect(exit).not.toHaveBeenCalled();
    });

});
