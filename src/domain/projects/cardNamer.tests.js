import { updateBaseName } from './cardNamer.js';
import { useGame } from '../../shared/testing/gameFixture.js';

describe('Card naming', () => {
    useGame('magic');

    beforeEach(() => {
        activeProject.cards = [];
    });

    function namedCard(name) {
        const card = new activeGame.Card({ front: { name } });
        activeProject.cards.push(card);
        updateBaseName(card);
        return card;
    }

    it('uses the card name', () => {
        expect(namedCard('Lightning Bolt').baseName).toBe('Lightning Bolt');
    });

    it('names an unnamed card "blank"', () => {
        expect(namedCard('').baseName).toBe('blank');
    });

    it('replaces characters that are unsafe in file names', () => {
        expect(namedCard('~/.\u0000ssh\\authorized_keys').baseName)
            .toBe('~-.-ssh-authorized_keys');
    });

    it('keeps " - " free for face and image suffixes', () => {
        expect(namedCard('test - back').baseName).toBe('test--back');
    });

    it('numbers conflicting names without regard to case', () => {
        namedCard('Lightning Bolt');
        expect(namedCard('lightning bolt').baseName).toBe('lightning bolt-2');
        expect(namedCard('LIGHTNING BOLT').baseName).toBe('LIGHTNING BOLT-3');
    });

    it('keeps the name when a rename sanitizes to the same file name', () => {
        const card = namedCard('Test:');
        card.front.name = 'Test/';
        updateBaseName(card);
        expect(card.baseName).toBe('Test-');
    });

    it('ignores cards that have not been named yet', () => {
        activeProject.cards.push(new activeGame.Card({ front: { name: 'Shock' } }));
        expect(namedCard('Shock').baseName).toBe('Shock');
    });
});
