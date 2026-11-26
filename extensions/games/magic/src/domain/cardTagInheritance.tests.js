import { editCardTags, reconcileCardTags } from './cardTagInheritance.js';

describe('stored inherited tags', () => {
    it('fills in missing parents and preserves existing assignments', () => {
        const card = reconcileCardTags({ tags: ['draw', 'repeatable-pure-draw'] });
        expect(card.tags).toEqual(['draw', 'repeatable-pure-draw', 'pure-draw']);
        expect(card.inheritedTags).toEqual(['pure-draw']);
        expect(editCardTags(card, [], 'repeatable-pure-draw').tags).toEqual(['draw']);
    });

    it('removes inherited tags when the last source goes away', () => {
        const card = reconcileCardTags({ tags: ['burn-any', 'burn-creature'] });
        const afterRemoval = editCardTags(card, [], 'burn-any');
        expect(afterRemoval.tags).toEqual(['burn-creature', 'removal-creature']);
    });

    it('keeps the original tag name on cards using the draw-engine alias', () => {
        const card = reconcileCardTags({ tags: ['draw-engine'] });
        expect(card.tags).toEqual(['draw-engine', 'pure-draw', 'draw']);
        expect(card.inheritedTags).toEqual(['pure-draw', 'draw']);
    });

    it('remembers an exclusion and clears it when the tag is added by hand', () => {
        const card = reconcileCardTags({ tags: ['repeatable-pure-draw'] });
        const afterRemoval = editCardTags(card, [], 'pure-draw');
        expect(afterRemoval.tags).toEqual(['repeatable-pure-draw', 'draw']);
        expect(afterRemoval.excludedInheritedTags).toEqual(['pure-draw']);
        expect(reconcileCardTags(afterRemoval)).toEqual(afterRemoval);

        const restored = editCardTags(afterRemoval, ['pure-draw']);
        expect(restored.tags).toEqual(['repeatable-pure-draw', 'draw', 'pure-draw']);
        expect(restored.excludedInheritedTags).toEqual([]);
        expect(restored.inheritedTags).toEqual(['draw']);
    });
});
