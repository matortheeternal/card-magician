import { tagSuggestionChanges } from './tagSuggestions.js';

describe('tag suggestion changes', () => {
    function decide(card, accepted, declined = []) {
        return new Map([[card, { accepted, declined }]]);
    }

    it('adds accepted tags and records the previous values', () => {
        const card = { tags: ['flier'] };
        const [change] = tagSuggestionChanges(decide(card, ['draw']));
        expect(change.card).toBe(card);
        expect(change.oldValues.tags).toEqual(['flier']);
        expect(change.newValues.tags).toContain('flier');
        expect(change.newValues.tags).toContain('draw');
        expect(change.newValues.dismissedTags).toBeUndefined();
    });

    it('dismisses declined tags only when asked', () => {
        const card = { tags: [], dismissedTags: ['ramp'] };
        expect(tagSuggestionChanges(decide(card, [], ['lifegain']))).toEqual([]);
        const [change] = tagSuggestionChanges(decide(card, [], ['lifegain']), {
            dismissDeclined: true
        });
        expect(change.oldValues).toEqual({ dismissedTags: ['ramp'] });
        expect(change.newValues).toEqual({ dismissedTags: ['ramp', 'lifegain'] });
    });

    it('records missing properties so undo can remove them again', () => {
        const card = {};
        const [change] = tagSuggestionChanges(decide(card, ['draw'], ['ramp']), {
            dismissDeclined: true
        });
        expect(Object.hasOwn(change.oldValues, 'tags')).toBeTrue();
        expect(change.oldValues.tags).toBeUndefined();
        expect(change.oldValues.dismissedTags).toBeUndefined();
        expect(change.newValues.dismissedTags).toEqual(['ramp']);
    });
});
