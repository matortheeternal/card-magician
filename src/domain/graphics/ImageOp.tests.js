import ImageOp from './ImageOp.js';
import imageCache from './ImageCache.js';

let renders = 0;
const countedOp = ImageOp.register(function countedTestOp(id) {
    renders++;
    return { id };
});

describe('ImageOp', () => {
    let saved;

    beforeEach(() => {
        renders = 0;
        saved = new Map();
        spyOn(imageCache, 'has').and.callFake(name => saved.has(name));
        spyOn(imageCache, 'get').and.callFake(name => saved.get(name));
        spyOn(imageCache, 'save').and.callFake(async name => {
            await Promise.resolve();
            saved.set(name, `blob:${name}`);
            return `blob:${name}`;
        });
    });

    it('shares one render and cache write between concurrent publishes', async () => {
        const op = countedOp('shared');
        const results = await Promise.all([
            op.publish(), op.publish(), countedOp('shared').publish()
        ]);
        expect(new Set(results).size).toBe(1);
        expect(renders).toBe(1);
        expect(imageCache.save).toHaveBeenCalledTimes(1);
        await countedOp('shared').publish();
        expect(imageCache.save).toHaveBeenCalledTimes(1);
    });

    it('allows a failed publish to be retried', async () => {
        imageCache.save.and.rejectWith(new Error('render failed'));
        await expectAsync(countedOp('retry').publish()).toBeRejected();
        imageCache.save.and.resolveTo('blob:retry');
        expect(await countedOp('retry').publish()).toBe('blob:retry');
        expect(renders).toBe(2);
    });
});
