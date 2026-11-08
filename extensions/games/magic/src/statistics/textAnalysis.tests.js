import {
    countRulesWords, creatureTypes, median, wordCountBucket, wordCountCategories
} from './textAnalysis.js';

describe('Magic designer statistics', () => {
    it('counts rules words including reminder text without counting mana symbols', () => {
        expect(countRulesWords('Flying\n{2}{U}: Draw a card. (Then discard a card.)'))
            .toBe(8);
        expect(countRulesWords('_First strike_')).toBe(2);
        expect(countRulesWords('~ draws a card.')).toBe(4);
        expect(countRulesWords('{T}{W}')).toBe(0);
        expect(countRulesWords()).toBe(0);
    });

    it('counts multiple creature types once and preserves multiword types', () => {
        expect(creatureTypes({ superType: 'Creature', subType: 'Elf Warrior elf' }))
            .toEqual(['Elf', 'Warrior']);
        expect(creatureTypes({ superType: 'Creature', subType: 'Time Lord Doctor' }))
            .toEqual(['Time Lord', 'Doctor']);
        expect(creatureTypes({ superType: 'Land', subType: 'Forest' })).toEqual([]);
        expect(creatureTypes({ superType: 'Creature' })).toEqual(['No creature type']);
    });

    it('handles even medians and histogram boundary values', () => {
        expect(median([12, 2, 4, 8])).toBe(6);
        expect(median([9, 1, 5])).toBe(5);
        expect(median([])).toBeNull();
        expect([0, 1, 19, 20, 39, 40, 250].map(wordCountBucket))
            .toEqual([0, 1, 1, 20, 20, 40, 200]);
        expect(wordCountCategories([{ wordCount: 40 }]).map(category => category.label))
            .toEqual(['0', '1–19', '20–39', '40–59']);
    });
});
