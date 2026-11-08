import * as ManaScribe from 'mana-scribe';
import ColorIdentity from '../domain/ColorIdentity.js';
import { cardRecord } from './cardRecord.js';

const game = { ManaScribe, ColorIdentity };

describe('Magic statistics card records', () => {
    it('extracts typed and text fields without mutating the source', () => {
        const face = Object.freeze({
            name: 'Elven Scholar', manaCost: '1G', superType: 'Artifact Creature',
            subType: 'Elf Wizard', rarity: 'uncommon', rulesText: 'Draw a card.'
        });
        const result = cardRecord({ front: face }, game);
        expect(result).toEqual({
            name: 'Elven Scholar', color: 'g', rarity: 'uncommon',
            types: ['Creature', 'Artifact'], manaValue: 2, isLand: false,
            wordCount: 3, creatureTypes: ['Elf', 'Wizard']
        });
        expect(face.manaCost).toBe('1G');
    });

    it('keeps multicolor and explicit color override precedence', () => {
        const record = (manaCost, colorOverride) => cardRecord({
            front: { manaCost, colorOverride }
        }, game);
        expect(record(ManaScribe.ManaCost.parse('WU')).color).toBe('m');
        expect(record('W', ['g']).color).toBe('g');
        expect(record('WU', ['c']).color).toBe('c');
        expect(record('', 'm').color).toBe('m');
    });

    it('normalizes missing fields and rejects invalid mana values', () => {
        const blank = cardRecord({}, game);
        expect(blank.color).toBe('c');
        expect(blank.rarity).toBe('common');
        expect(blank.types).toEqual(['Other']);
        expect(blank.manaValue).toBe(0);
        expect(blank.wordCount).toBe(0);
        expect(blank.creatureTypes).toEqual([]);
        expect(blank.name).toBe('Unnamed card');
        for (const cmc of [-1, Infinity, NaN])
            expect(cardRecord({ front: { manaCost: { cmc } } }, game).manaValue)
                .toBeNull();
        const invalidGame = {
            ColorIdentity,
            ManaScribe: { ManaCost: { parse() { throw new Error('Invalid cost'); } } }
        };
        expect(cardRecord({ front: { manaCost: 'invalid' } }, invalidGame).manaValue)
            .toBeNull();
    });

    it('uses rarity alone for eligibility and ignores back-face fields', () => {
        const card = {
            front: { superType: 'Token Creature', rarity: 'special' },
            back: { manaCost: 'R', rarity: 'rare' }
        };
        const record = cardRecord(card, game);
        expect(record.rarity).toBe('special');
        expect(record.color).toBe('c');
        expect(record.manaValue).toBe(0);
        expect('isAuxiliary' in record).toBeFalse();
        expect(cardRecord({ front: { rarity: 'token' } }, game).rarity).toBe('unknown');
        expect(cardRecord({ front: { superType: 'Land' } }, game).isLand).toBeTrue();
    });
});
