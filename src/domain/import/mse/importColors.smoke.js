import { importCard } from './importMse.js';

const cases = [
    {
        label: 'a monocolor spell',
        source: { card_color: 'red', casting_cost: '2R' }, colors: ['r'],
    },
    {
        label: 'a multicolor spell regardless of override order',
        source: { card_color: 'green, red, multicolor', casting_cost: 'RG' },
        colors: ['r', 'g'],
    },
    {
        label: 'a colorless spell',
        source: { card_color: 'colorless', casting_cost: '3' }, colors: [],
    },
    {
        label: 'an artifact with its natural frame',
        source: { card_color: 'artifact', super_type: 'Artifact', casting_cost: '3' },
        colors: [],
    },
    {
        label: 'a hybrid spell with matching hybrid styling',
        source: { card_color: 'white, blue, hybrid', casting_cost: 'W/U' },
        colors: ['w', 'u'],
    },
    {
        label: 'a land with an implicit basic-land subtype',
        source: { card_color: 'green, land', super_type: 'Land', sub_type: 'Forest' },
        colors: ['g'],
    },
    {
        label: 'a land deriving colors from rules text',
        source: { card_color: 'green, land', super_type: 'Land',
            rule_text: '<sym>T</sym>: Add <sym>G</sym>.' }, colors: ['g'],
    },
    {
        label: 'a colorless land',
        source: { card_color: 'colorless, land', super_type: 'Land',
            rule_text: '<sym>T</sym>: Add <sym>C</sym>.' }, colors: [],
    },
    {
        label: 'a land combining subtype and rules-text colors',
        source: { card_color: 'green, blue, land', super_type: 'Land',
            sub_type: 'Forest', rule_text: '<sym>T</sym>: Add <sym>U</sym>.' },
        colors: ['u', 'g'],
    },
    {
        label: 'a spell whose ability uses a different color',
        source: { card_color: 'red', casting_cost: 'R', super_type: 'Creature',
            rule_text: '<sym>G</sym>: Regenerate this creature.' }, colors: ['r'],
    },
];

const preservedCases = [
    {
        label: 'a different color',
        source: { card_color: 'green', casting_cost: 'R' }, override: ['g'],
    },
    {
        label: 'a colorless override on a colored spell',
        source: { card_color: 'colorless', casting_cost: 'R' }, override: ['c'],
    },
    {
        label: 'a colored creature without a mana cost',
        source: { card_color: 'red', super_type: 'Creature',
            rule_text: '<sym>R</sym>: This creature gets +1/+0.' }, override: ['r'],
    },
    {
        label: 'gold styling on a hybrid mana cost',
        source: { card_color: 'white, blue', casting_cost: 'W/U' },
        override: ['w', 'u'],
    },
    {
        label: 'hybrid styling on a gold mana cost',
        source: { card_color: 'white, blue, hybrid', casting_cost: 'WU' },
        override: ['w', 'u', 'h'],
    },
    {
        label: 'an artifact frame on a nonartifact',
        source: { card_color: 'artifact', super_type: 'Creature' }, override: ['a'],
    },
    {
        label: 'artifact coloring on a colored artifact',
        source: { card_color: 'red, artifact', super_type: 'Artifact',
            casting_cost: 'R' },
        override: ['r', 'a'],
    },
    {
        label: 'a land frame on a nonland',
        source: { card_color: 'land', super_type: 'Creature' }, override: ['l'],
    },
    {
        label: 'forced multicolor styling',
        source: { card_color: 'red, multicolor', casting_cost: 'R' },
        override: ['r', 'm'],
    },
];

async function importFace(source, stylesheet = 'm15-altered') {
    const failures = [];
    const onFailure = error => failures.push(error.message);
    const card = await importCard({ stylesheet }, { name: 'Test', ...source }, {},
                                  onFailure);
    expect(failures).toEqual([]);
    expect(card).not.toBeNull();
    return card;
}

describe('MSE colors', () => {
    for (const { label, source, colors } of cases) {
        it(`removes a redundant override for ${label}`, async () => {
            const { front } = await importFace(source);
            expect(front.colorOverride).toBeUndefined();
            expect(front.colors.map(color => color.char)).toEqual(colors);
        });
    }

    for (const { label, source, override } of preservedCases) {
        it(`preserves ${label}`, async () => {
            const { front } = await importFace(source);
            expect(front.colorOverride).toEqual(override);
        });
    }

    it('allows automatic colors to follow later mana-cost edits', async () => {
        const { front } = await importFace({ card_color: 'red', casting_cost: 'R' });
        front.manaCost = activeGame.ManaScribe.ManaCost.parse('U');
        activeGame.addComputedProps(front);
        expect(front.colors.map(color => color.char)).toEqual(['u']);
    });

    it('normalizes both faces of an older DFC', async () => {
        const card = await importFace({
            card_color: 'red', casting_cost: 'R',
            card_color_2: 'green, land', super_type_2: 'Land', sub_type_2: 'Forest',
        }, 'm15-mainframe-dfc');
        expect(card.front.colorOverride).toBeUndefined();
        expect(card.back.colorOverride).toBeUndefined();
        expect(card.back.colors.map(color => color.char)).toEqual(['g']);
    });

    it('normalizes an Adventure subcard independently', async () => {
        const card = await importFace({
            card_color: 'green', casting_cost: 'G',
            card_color_2: 'red', casting_cost_2: 'R',
        }, 'm15-adventure');
        expect(card.front.colorOverride).toBeUndefined();
        expect(card.front.adventure.colorOverride).toBeUndefined();
        expect(card.front.adventure.colors.map(color => color.char)).toEqual(['r']);
    });

    it('keeps token colors without assigning a casting cost', async () => {
        const { front } = await importFace({ casting_cost: 'R' }, 'm15-mainframe-tokens');
        expect(front.manaCost).toBeUndefined();
        expect(front.colorOverride).toEqual(['r']);
        expect(front.colors.map(color => color.char)).toEqual(['r']);
    });
});
