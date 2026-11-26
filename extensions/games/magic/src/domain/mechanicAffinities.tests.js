import { inferMechanicAffinities } from './mechanicAffinities.js';

const KEYWORD = { kind: 'keywords', definition: { name: 'Mistsong' } };

function examples(manaCost, count, rulesText = 'Mistsong') {
    return Array.from({ length: count }, () => ({ faces: [{ manaCost, rulesText }] }));
}

describe('mechanic affinity autodetection', () => {
    it('ranks monocolored cards and skips multicolored cards and mentions', () => {
        const cards = [
            ...examples('U', 4), ...examples('W', 2), ...examples('B', 1),
            ...examples('RG', 6), ...examples('R', 6, 'Draw a card. (Mistsong)')
        ];
        const [entry] = inferMechanicAffinities([KEYWORD], cards);
        expect(entry.definition.tiers).toEqual({
            U: 'primary', W: 'secondary', B: 'tertiary'
        });
    });

    it('preserves a saved affinity even when every color was set to Never', () => {
        const entry = { ...KEYWORD, definition: { ...KEYWORD.definition, tiers: {} } };
        expect(inferMechanicAffinities([entry], examples('U', 2))[0]).toBe(entry);
    });
});
