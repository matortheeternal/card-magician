import { initializeCardFace } from './initializeCardFace.js';
import { getCardTypes, isLand, isBasicLand, isPermanent } from './cardTypes.js';
import { matchChoices, parseList, matchStation, parseStationLevels }
    from './textStructures.js';

describe('Magic card face traits', () => {
    it('provides methods before fields are loaded and reads subsequent edits', () => {
        const face = {};
        initializeCardFace(face);
        expect(face.isLand()).toBeFalse();
        expect(face.hasNoText()).toBeTrue();
        expect(face.isTransform()).toBeFalse();
        face.superType = 'Legendary Snow Land';
        face.subType = 'Plains Island';
        face.rulesText = 'Daybound';
        expect(face.isLand()).toBeTrue();
        expect(face.isLegendary()).toBeTrue();
        expect(face.isSnow()).toBeTrue();
        expect(face.isTransform()).toBeTrue();
        expect(face.getImplicitLandSymbols()).toEqual([
            { colors: ['w'] }, { colors: ['u'] }
        ]);
        face.superType = 'Creature';
        expect(face.isLand()).toBeFalse();
        expect(face.getImplicitLandSymbols()).toEqual([]);
    });

    it('preserves the existing type and keyword method names', () => {
        const face = {};
        initializeCardFace(face);
        const cases = [
            ['isCreature', 'superType', 'Creature'],
            ['isArtifact', 'superType', 'Artifact'],
            ['isEnchantment', 'superType', 'Enchantment'],
            ['isVehicle', 'subType', 'Vehicle'],
            ['isConspiracy', 'superType', 'Conspiracy'],
            ['isToken', 'superType', 'Token'],
            ['isEmblem', 'superType', 'Emblem'],
            ['isBasicLand', 'superType', 'Basic Land'],
            ['isCompanion', 'rulesText', 'Companion — A condition.'],
            ['isMiracle', 'rulesText', 'Miracle {W}'],
            ['isMutate', 'rulesText', 'Mutate {G}']
        ];
        for (const [method, field, value] of cases) {
            face[field] = '';
            expect(face[method]()).withContext(method).toBeFalse();
            face[field] = value.toLowerCase();
            expect(face[method]()).withContext(method).toBeTrue();
        }
        for (const rulesText of [
            'Transform this card.', 'Transformed', 'Daybound',
            'Disturb {U}', 'More Than Meets the Eye {2}'
        ]) {
            face.rulesText = rulesText;
            expect(face.isTransform()).withContext(rulesText).toBeTrue();
        }
    });

    it('keeps methods out of copied data and supports rebuilding', () => {
        const face = { superType: 'Land' };
        initializeCardFace(face);
        initializeCardFace(face);
        expect({ ...face }).toEqual({ superType: 'Land' });
        expect(JSON.stringify(face)).toBe('{"superType":"Land"}');
        expect(face.isLand()).toBeTrue();
        face.isLand = () => false;
        expect(face.isLand()).toBeFalse();
    });

    it('shares type semantics with plain saved faces', () => {
        expect(isLand({ superType: 'Island creature' })).toBeFalse();
        expect(isBasicLand({ superType: 'Basic Land' })).toBeTrue();
        expect(isPermanent({ superType: 'Battle' })).toBeTrue();
        expect(getCardTypes({ superType: 'Tribal Artifact Creature' }))
            .toEqual(['Creature', 'Artifact', 'Kindred']);
        expect(getCardTypes({ superType: 'Tribal Kindred Instant' }))
            .toEqual(['Instant', 'Kindred']);
        expect(getCardTypes({})).toEqual(['Other']);
    });

    it('recognizes choices repeatedly without changing parser state', () => {
        const face = { rulesText: '- Draw a card.\n- Gain life.' };
        initializeCardFace(face);
        for (let i = 0; i < 3; i++) {
            expect(face.hasChoices()).toBeTrue();
            expect(parseList(matchChoices(face.rulesText)[0]))
                .toEqual(['Draw a card.', 'Gain life.']);
        }
        face.rulesText = 'Ordinary rules text.';
        expect(face.hasChoices()).toBeFalse();
    });

    it('shares station recognition and parsing with rendering', () => {
        const face = { rulesText: 'Station 2\n2+ | Flying\n5+ | Vigilance' };
        initializeCardFace(face);
        expect(face.isStation()).toBeTrue();
        expect(parseStationLevels(matchStation(face.rulesText)[2])).toEqual([
            { range: '2+', content: 'Flying\n' },
            { range: '5+', content: 'Vigilance' }
        ]);
    });
});
