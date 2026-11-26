import PendingWork from '../card/PendingWork.js';

class WatchingModule extends CardMagicianModule {}

describe('CardMagicianModule watch', () => {
    it('tracks promises returned by watch callbacks as card work', async () => {
        const card = { pendingWork: new PendingWork(), name: 'Bolt' };
        const module = new WatchingModule(card, 'test/Watching', {});
        let updated = false;
        module.watch(card, 'name', async () => {
            await new Promise(resolve => { setTimeout(resolve, 20); });
            updated = true;
        });
        changed(card, 'name');
        expect(card.pendingWork.isIdle).toBeFalse();
        await card.pendingWork.settled();
        expect(updated).toBeTrue();
        module.dispose();
    });
});
