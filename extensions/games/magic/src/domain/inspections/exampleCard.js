const GENERIC_COST = '{2}';
const STATS_BY_TYPE = {
    Creature: { power: '2', toughness: '2' }
};

export default function exampleCard(inspection, color) {
    const { typeLine, text } = inspection.example;
    const { ManaCost } = activeGame.ManaScribe;
    return {
        front: {
            name: inspection.title,
            manaCost: ManaCost.parse(`${GENERIC_COST}{${color}}`),
            superType: typeLine,
            subType: '',
            rulesText: text,
            rarity: 'common',
            ...STATS_BY_TYPE[typeLine]
        }
    };
}
