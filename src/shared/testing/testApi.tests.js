const api = cmTest;

describe('Extension test API', () => {
    it('is available before specs load and exposes only supported helpers', () => {
        expect(api).toBe(window.cmTest);
        expect(Object.keys(api).sort()).toEqual([
            'click', 'closeSettings', 'eventually', 'openSettings'
        ]);
    });

    it('waits for asynchronous conditions and preserves their result', async () => {
        const result = { ready: true };
        let attempts = 0;
        expect(await api.eventually(async () => {
            return ++attempts > 1 ? result : null;
        }, { interval: 1 })).toBe(result);
    });

    it('rejects unsatisfied conditions and missing controls', async () => {
        await expectAsync(api.eventually(() => false, { timeout: 0 }))
            .toBeRejectedWithError(/Condition not met/);
        await expectAsync(api.click(null))
            .toBeRejectedWithError('Cannot click a missing control');
    });
});
