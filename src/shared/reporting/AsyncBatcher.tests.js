import AsyncBatcher from './AsyncBatcher.js';

describe('AsyncBatcher', () => {
    beforeEach(() => jasmine.clock().install());
    afterEach(() => jasmine.clock().uninstall());

    it('tracks queued and running batches until they finish', async () => {
        let finish;
        const write = () => new Promise(resolve => { finish = resolve; });
        const batcher = new AsyncBatcher(write);
        expect(batcher.pending).toBeFalse();
        batcher.add('item');
        expect(batcher.pending).toBeTrue();
        const flushed = batcher.flush();
        await Promise.resolve();
        expect(batcher.pending).toBeTrue();
        finish();
        await flushed;
        expect(batcher.pending).toBeFalse();
    });

    it('writes items together after a fixed delay', async () => {
        const write = jasmine.createSpy('write').and.resolveTo();
        const batcher = new AsyncBatcher(write, { delay: 3000 });

        batcher.add('first');
        jasmine.clock().tick(2000);
        batcher.add('second');
        jasmine.clock().tick(999);
        expect(write).not.toHaveBeenCalled();

        jasmine.clock().tick(1);
        await batcher.flush();

        expect(write).toHaveBeenCalledOnceWith(['first', 'second']);
    });

    it('flushes when the batch reaches its item limit', async () => {
        const write = jasmine.createSpy('write').and.resolveTo();
        const batcher = new AsyncBatcher(write, { maxItems: 2 });

        batcher.add('first');
        batcher.add('second');
        await batcher.flush();

        expect(write).toHaveBeenCalledOnceWith(['first', 'second']);
    });

    it('writes batches in their flush order', async () => {
        const writes = [];
        const resolvers = [];
        const write = batch => new Promise(resolve => {
            writes.push(batch);
            resolvers.push(resolve);
        });
        const batcher = new AsyncBatcher(write);

        batcher.add('first');
        const firstWrite = batcher.flush();
        await Promise.resolve();
        batcher.add('second');
        const secondWrite = batcher.flush();
        await Promise.resolve();

        expect(writes).toEqual([['first']]);
        resolvers.shift()();
        await firstWrite;
        expect(writes).toEqual([['first'], ['second']]);

        resolvers.shift()();
        await secondWrite;
    });

    it('logs write failures and continues with later batches', async () => {
        const onError = jasmine.createSpy('onError');
        const write = jasmine.createSpy('write').and.callFake(async batch => {
            if (batch[0] === 'first') throw new Error('Disk full');
        });
        const batcher = new AsyncBatcher(write, { onError });

        batcher.add('first');
        await batcher.flush();
        batcher.add('second');
        await batcher.flush();

        expect(onError).toHaveBeenCalledOnceWith(jasmine.any(Error));
        expect(write.calls.allArgs()).toEqual([[['first']], [['second']]]);
    });
});
