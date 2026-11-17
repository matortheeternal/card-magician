import * as history from '../historySystem.js';
import platform from '../../../shared/platformAdapter.js';
import YAMLSerializer from '../../../domain/projects/serializers/YAMLSerializer.js';
import { useGame } from '../../../shared/testing/gameFixture.js';
import { useProjectOnDisk } from '../../../shared/testing/projectFixture.js';

function cardEvent(type, cards) {
    return new CustomEvent(type, { detail: { cards } });
}

function createCards(cards) {
    return history.execute(activeProject, cardEvent('cm-cards-created', cards));
}

function deleteCards(cards) {
    return history.execute(activeProject, cardEvent('cm-cards-deleted', cards));
}

function failing(card, method, message) {
    const spy = spyOn(card, method).and.rejectWith(new Error(message));
    Object.defineProperty(card, method, { enumerable: false });
    return spy;
}

describe('Card list history', () => {
    useGame('magic');
    useProjectOnDisk('card-list-history');

    beforeEach(async () => {
        spyOn(window.actions, 'get').and.callThrough()
            .withArgs('set-status').and.returnValue(() => {});
        await history.reset();
    });

    afterEach(async () => {
        await history.reset();
    });

    function newCard(name) {
        return new activeGame.Card({ front: { name } });
    }

    it('restores files of earlier cards when a batch deletion fails', async () => {
        const first = newCard('First');
        const second = newCard('Second');
        await createCards([first, second]);
        const paths = [first.files.get('data'), second.files.get('data')];
        await history.reset();
        const deletion = failing(second, 'deleteFiles', 'Expected delete failure');

        await expectAsync(deleteCards([first, second])).toBeRejected();
        expect(activeProject.cards).toEqual([first, second]);
        for (const path of paths)
            expect(await platform.checkFileExists(path)).toBeTrue();

        await history.undo();
        expect(activeProject.cards).toEqual([first, second]);
        deletion.and.callThrough();
        await deleteCards([first, second]);
        await history.undo();
        expect(activeProject.cards).toEqual([first, second]);
    });

    it('does not record a creation whose save fails, and allows a retry', async () => {
        const card = newCard('Retry');
        const save = failing(card, 'save', 'Expected create failure');

        await expectAsync(createCards([card])).toBeRejected();
        expect(activeProject.cards).toEqual([]);
        await history.undo();
        expect(activeProject.cards).toEqual([]);

        save.and.callThrough();
        await createCards([card]);
        expect(activeProject.cards).toEqual([card]);
        await history.undo();
        expect(activeProject.cards).toEqual([]);
    });

    it('keeps concurrent creations in the order they were requested', async () => {
        const first = newCard('First');
        const second = newCard('Second');
        await Promise.all([createCards([first]), createCards([second])]);
        expect(activeProject.cards).toEqual([first, second]);
        await history.undo();
        expect(activeProject.cards).toEqual([first]);
        await history.undo();
        expect(activeProject.cards).toEqual([]);
    });

    async function savedSequence(card) {
        return (await YAMLSerializer.load(card.files.get('data'))).sequence;
    }

    it('numbers created cards in creation order and saves the numbers', async () => {
        const first = newCard('First');
        const second = newCard('Second');
        const third = newCard('Third');
        await createCards([first]);
        await createCards([second, third]);
        expect([first, second, third].map(card => card.sequence)).toEqual([1, 2, 3]);
        expect(await savedSequence(third)).toBe(3);
    });

    it('gives a copied card a new number instead of its source number', async () => {
        const source = newCard('Source');
        await createCards([source]);
        const copy = new activeGame.Card({ front: { name: 'Copy' }, sequence: 1 });
        await createCards([copy]);
        expect(copy.sequence).toBe(2);
        expect(await savedSequence(copy)).toBe(2);
    });

    it('keeps numbers through undo and redo, and does not reuse them', async () => {
        const first = newCard('First');
        const second = newCard('Second');
        await createCards([first]);
        await createCards([second]);
        await deleteCards([first]);
        await history.undo();
        expect(activeProject.cards).toEqual([first, second]);
        expect(await savedSequence(first)).toBe(1);

        await history.undo();
        await history.redo();
        expect(second.sequence).toBe(2);
        expect(await savedSequence(second)).toBe(2);

        await history.undo();
        const third = newCard('Third');
        await createCards([third]);
        expect(third.sequence).toBe(3);
    });
});
