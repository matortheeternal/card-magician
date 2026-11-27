import { matchAutoTemplate } from './autoTemplate.js';

describe('Auto template rules', () => {
    const saga = {
        id: 'magic/M15/Saga',
        autoMatch: { superType: ['Enchantment'], subType: ['Saga'] }
    };
    const sagaCreature = {
        id: 'magic/M15/SagaCreature',
        autoMatch: { superType: ['Enchantment', 'Creature'], subType: ['Saga'] }
    };

    it('requires whole words and every configured term, ignoring case and order', () => {
        const templates = [saga, sagaCreature];
        expect(matchAutoTemplate(templates, {
            superType: 'Legendary CREATURE enchantment', subType: 'Saga'
        })).toBe(sagaCreature);
        expect(matchAutoTemplate(templates, {
            superType: 'Enchantment', subType: 'Saga'
        })).toBe(saga);
        expect(matchAutoTemplate(templates, {
            superType: 'Creature Enchantment', subType: 'Sagas'
        })).toBeUndefined();
    });

    it('breaks ties by template ID independently of registration order', () => {
        const classic = { ...saga, id: 'magic/Classic/Saga' };
        const face = { superType: 'Enchantment', subType: 'Saga' };
        expect(matchAutoTemplate([saga, classic], face)).toBe(classic);
        expect(matchAutoTemplate([classic, saga], face)).toBe(classic);
    });

    it('skips templates with absent, empty or unknown match rules', () => {
        const templates = [
            { id: 'No rule' },
            { id: 'Empty', autoMatch: {} },
            { id: 'Unknown', autoMatch: { rarity: ['Rare'] } }
        ];
        expect(matchAutoTemplate(templates, { rarity: 'Rare' })).toBeUndefined();
    });
});
