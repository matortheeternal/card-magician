import {
    importCard, importCards, addCardsToProject, importMseFile
} from './importMse.js';
import MseFileAdapter from './MseFileAdapter.js';
import { registerProgressEndpoint } from '../../../ui/systems/progressSystem.js';

describe('partial MSE card import', () => {
    let previousGame;
    beforeEach(() => {
        previousGame = window.activeGame;
        window.activeGame = {
            Card: class { front = {}; },
            Project: class { cards = []; },
            ColorIdentity: { normalizeColorOverride: () => {} },
            addComputedProps: () => {}
        };
    });
    afterEach(() => window.activeGame = previousGame);

    async function run(card) {
        const project = { cards: [] };
        const onFailure = jasmine.createSpy('onFailure');
        const onProgress = jasmine.createSpy('onProgress');
        const unregister = registerProgressEndpoint({
            incrementProgress: onProgress, setOperation: () => {}
        });
        const mseSet = {
            card, stylesheet: 'm15-altered', stylesheet_version: '2026-09-06'
        };
        for (const entry of card)
            if (entry.fail) entry.image = 'broken.png';
        const adapter = { getImage: async () => { throw new Error('Broken card'); } };
        try {
            const cardMap = await importCards(mseSet, adapter, onFailure);
            addCardsToProject(cardMap, project, onFailure);
        } finally {
            unregister();
        }
        return { project, mseSet, onFailure, onProgress };
    }

    it('converts a single card', async () => {
        const source = { name: 'Single' };
        const card = await importCard({
            card: [source], stylesheet: 'm15-altered',
            stylesheet_version: '2026-09-06'
        }, source, {});
        expect(card.front.name).toBe('Single');
    });

    it('reports the card name and preserves the original error and stack', async () => {
        const source = { name: 'Broken', image: 'broken.png' };
        const mseSet = {
            card: [source], stylesheet: 'm15-altered',
            stylesheet_version: '2026-09-06'
        };
        const originalError = new Error('Image read failed');
        const originalStack = originalError.stack;
        const onFailure = jasmine.createSpy('onFailure');
        const adapter = { getImage: async () => { throw originalError; } };

        const card = await importCard(mseSet, source, adapter, onFailure);

        expect(card).toBeNull();
        expect(onFailure).toHaveBeenCalledTimes(1);
        expect(onFailure).toHaveBeenCalledWith(originalError, 'Broken');
        expect(originalError.stack).toBe(originalStack);
        expect(originalError.importContext).toBeUndefined();
    });

    it('keeps successful cards and reports the failed card', async () => {
        const result = await run([
            { name: 'First' },
            { name: 'Broken', uid: 'bad', fail: true },
            { name: 'Last' }
        ]);
        expect(result.project.cards.map(card => card.front.name))
            .toEqual(['First', 'Last']);
        expect(result.onProgress).toHaveBeenCalledTimes(3);
        expect(result.onFailure).toHaveBeenCalledTimes(1);
        const [error, cardName] = result.onFailure.calls.first().args;
        expect(error.message).toBe('Broken card');
        expect(cardName).toBe('Broken');
    });

    it('skips a front whose back failed and continues with unrelated cards', async () => {
        const result = await run([
            {
                name: 'Front', uid: 'f',
                linked_relation_1: 'Back Face', linked_card_1: 'b'
            },
            { name: 'Back', uid: 'b', fail: true, linked_relation_1: 'Front Face' },
            { name: 'Other' }
        ]);
        expect(result.project.cards.map(card => card.front.name)).toEqual(['Other']);
        expect(result.onFailure).toHaveBeenCalledTimes(2);
        const [error, cardName] = result.onFailure.calls.argsFor(1);
        expect(error.message).toContain('Could not find back face');
        expect(cardName).toBe('Front');
    });

    it('assembles linked faces without importing the back separately', async () => {
        const result = await run([
            {
                name: 'Front', uid: 'f',
                linked_relation_1: 'Back Face', linked_card_1: 'b'
            },
            { name: 'Back', uid: 'b', linked_relation_1: 'Front Face' }
        ]);
        expect(result.project.cards.length).toBe(1);
        expect(result.project.cards[0].back.name).toBe('Back');
        expect(result.onFailure).not.toHaveBeenCalled();
    });

    it('returns failures without inserting partially converted cards', async () => {
        const result = await run([{ name: 'Broken', fail: true }]);
        expect(result.project.cards).toEqual([]);
        expect(result.onFailure).toHaveBeenCalledTimes(1);
    });

    async function importFile(card) {
        const mseSet = {
            card, mse_version: '2.6.0', game: 'magic', game_version: '2026-09-06',
            stylesheet: 'm15-altered', stylesheet_version: '2026-09-06', set_info: {}
        };
        spyOn(MseFileAdapter, 'load').and.resolveTo({
            setInfo: async () => mseSet,
            getImage: async () => { throw new Error('Broken card'); }
        });
        return importMseFile('test.mse-set');
    }

    it('returns a project and no failures for a complete import', async () => {
        const [project, failures] = await importFile([{ name: 'Good' }]);
        expect(project.cards.map(card => card.front.name)).toEqual(['Good']);
        expect(failures).toEqual([]);
    });

    it('returns partial results with card names and errors', async () => {
        const [project, failures] = await importFile([
            { name: 'Good' }, { name: 'Broken', uid: 'bad', image: 'broken.png' }
        ]);
        expect(project.cards.map(card => card.front.name)).toEqual(['Good']);
        expect(failures.length).toBe(1);
        expect(failures[0].error.message).toBe('Broken card');
        expect(failures[0]).toEqual({ cardName: 'Broken', error: jasmine.any(Error) });
    });

    it('rejects a nonempty set when no cards import successfully', async () => {
        await expectAsync(importFile([
            { name: 'Broken', image: 'broken.png' }
        ])).toBeRejectedWithError(
            'No cards could be imported. See the error report for details.'
        );
    });

});
