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
            colorCombination: 'g', colorCount: 1, hasArtCredit: false,
            power: null, toughness: null, creatureShape: null,
            types: ['Creature', 'Artifact'], manaValue: 2, isLand: false,
            wordCount: 3, creatureTypes: ['Elf', 'Wizard'],
            isPermanent: true, isLegendary: false, nonCreatureSubtypes: []
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
        for (const cmc of [-1, Infinity, NaN]) {
            expect(cardRecord({ front: { manaCost: { cmc } } }, game).manaValue)
                .toBeNull();
        }
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

    it('classifies numeric creature bodies without guessing symbolic statistics', () => {
        const record = (power, toughness, superType = 'Creature') => cardRecord({
            front: { power, toughness, superType }
        }, game);
        expect(record('2', '2').creatureShape).toBe('square');
        expect(record('3', '1').creatureShape).toBe('aggressive');
        expect(record('0', '4').creatureShape).toBe('defensive');
        expect(record(' 0 ', 0).creatureShape).toBe('square');
        expect(record('-1', '0.5').power).toBe(-1);
        expect(record('-1', '0.5').toughness).toBe(0.5);
        for (const value of ['', '*', '1+*', '2/3', null, undefined, Infinity, NaN]) {
            expect(record(value, '2').power).toBeNull();
            expect(record(value, '2').creatureShape).toBeNull();
        }
        expect(record('2', '2', 'Artifact').power).toBeNull();
        expect(record('2', '2', 'Artifact').creatureShape).toBeNull();
    });

    it('retains exact color sets and excludes ambiguous classifications', () => {
        const record = (manaCost, colorOverride) => cardRecord({
            front: { manaCost, colorOverride }
        }, game);
        expect(record('WU').colorCombination).toBe('wu');
        expect(record('WU').colorCount).toBe(2);
        expect(record('WUBRG').colorCount).toBe(5);
        expect(record('2').colorCount).toBe(0);
        expect(record('WU', ['c']).colorCombination).toBe('c');
        expect(record('WU', ['g']).colorCombination).toBe('g');
        expect(record('WU', ['g']).colorCount).toBe(1);
        expect(record('', ['m']).colorCount).toBeNull();
        expect(record('', ['m']).colorCombination).toBeNull();
        expect(record({ cmc: NaN }).colorCount).toBeNull();
    });

    it('uses effective front-face credits and leaves back-face policy unchanged', () => {
        const record = (illustrator, defaultCredit = '') => cardRecord({
            front: { illustrator }, back: { illustrator: 'Back artist', power: '5' }
        }, game, { illustrator: defaultCredit });
        expect(record('Artist').hasArtCredit).toBeTrue();
        expect(record('', 'Project artist').hasArtCredit).toBeTrue();
        expect(record(undefined, 'Project artist').hasArtCredit).toBeTrue();
        expect(record('').hasArtCredit).toBeFalse();
        expect(record('   ').hasArtCredit).toBeFalse();
        expect(record('   ', 'Project artist').hasArtCredit).toBeFalse();
        expect(record('').power).toBeNull();
    });

    it('recognizes Battle, Kindred and legacy Tribal card types', () => {
        expect(cardRecord({ front: { superType: 'Battle' } }, game).types)
            .toEqual(['Battle']);
        expect(cardRecord({ front: { superType: 'Kindred Enchantment' } }, game).types)
            .toEqual(['Enchantment', 'Kindred']);
        expect(cardRecord({ front: { superType: 'Tribal Instant' } }, game).types)
            .toEqual(['Instant', 'Kindred']);
    });

});
