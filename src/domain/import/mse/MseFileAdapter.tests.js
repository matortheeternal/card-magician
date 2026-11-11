import MseFileAdapter from './MseFileAdapter.js';
import { importCard } from './importMse.js';

function makeAdapter(set, files = {}) {
    const adapter = new MseFileAdapter();
    adapter.entries = {};
    for (const [name, text] of Object.entries({ set, ...files }))
        adapter.entries[name] = { text: async () => text };
    return adapter;
}

describe('MSE archive cards', () => {
    it('loads referenced cards in order, excluding unreferenced files', async () => {
        const adapter = makeAdapter('include_file: first\ninclude_file: second', {
            first: '\ufeffmse_version: 2.5.8\ncard:\n\tname: First',
            second: 'card:\n\tname: Second\ncard:\n\tname: Third',
            unused: 'card:\n\tname: Unused'
        });
        const data = await adapter.setInfo();
        expect(data.card.map(card => card.name)).toEqual(['First', 'Second', 'Third']);
        expect(await adapter.setInfo()).toBe(data);
    });

    it('combines inline cards and a single nested include', async () => {
        const adapter = makeAdapter('card:\n\tname: Inline\ninclude_file: outer', {
            outer: 'include_file: inner', inner: 'card:\n\tname: Included'
        });
        expect((await adapter.setInfo()).card.map(card => card.name))
            .toEqual(['Inline', 'Included']);
    });

    it('normalizes a single inline card and an empty set', async () => {
        expect((await makeAdapter('card:\n\tname: Only').setInfo()).card)
            .toEqual([{ name: 'Only' }]);
        expect((await makeAdapter('game: magic').setInfo()).card).toEqual([]);
    });

    it('reports missing includes clearly', async () => {
        await expectAsync(makeAdapter('include_file: absent').setInfo())
            .toBeRejectedWithError('Missing MSE archive entry: "absent"');
    });

    it('rejects circular includes', async () => {
        const adapter = makeAdapter('include_file: loop', { loop: 'include_file: loop' });
        await expectAsync(adapter.setInfo())
            .toBeRejectedWithError('Circular MSE include: "loop"');
    });
});

describe('MSE archive artwork', () => {
    it('imports a card when its referenced artwork is absent', async () => {
        const previousGame = window.activeGame;
        window.activeGame = { Card: class { front = {}; }, addComputedProps: () => {} };
        try {
            const onFailure = jasmine.createSpy('onFailure');
            const card = await importCard({ stylesheet: 'm15-altered' }, {
                name: 'Without art', image: 'missing.png'
            }, makeAdapter('game: magic'), onFailure);
            expect(card.front.name).toBe('Without art');
            expect(card.front.artImage).toBeUndefined();
            expect(onFailure).not.toHaveBeenCalled();
        } finally {
            window.activeGame = previousGame;
        }
    });

    it('still rejects unreadable artwork that exists in the archive', async () => {
        const adapter = makeAdapter('game: magic');
        adapter.entries['broken.png'] = {
            arrayBuffer: async () => { throw new Error('Unreadable image'); }
        };
        await expectAsync(adapter.getImage('broken.png'))
            .toBeRejectedWithError('Unreadable image');
    });
});
