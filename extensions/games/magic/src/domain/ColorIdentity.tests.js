import ColorIdentity, { getCardFaceColors } from './ColorIdentity.js';
import { ManaCost } from 'mana-scribe';

describe('card face colors', () => {
    function colors(face) {
        return getCardFaceColors(face).map(color => color.char);
    }

    it('handles a land starting with a tap symbol without crashing', () => {
        expect(colors({ superType: 'Land', rulesText: '{T}: Add {G}.' })).toEqual(['g']);
    });

    it('finds symbols after text and across multiple lines', () => {
        expect(colors({
            superType: 'Legendary Land',
            rulesText: 'Ability: {T}: Add {U}.\n{2}, {T}: Add {R} or {G}.'
        })).toEqual(['u', 'r', 'g']);
    });

    it('handles colorless lands and explicit overrides', () => {
        expect(colors({ superType: 'Land', rulesText: '{T}: Add {C}.' })).toEqual([]);
        expect(colors({
            superType: 'Land', rulesText: '{T}: Add {G}.', colorOverride: ['c']
        })).toEqual([]);
    });

    it('combines implicit land subtypes with rules-text symbols', () => {
        expect(colors({
            superType: 'Land', subType: 'Forest Island',
            rulesText: '{T}: Add {R}.',
        })).toEqual(['u', 'r', 'g']);
    });

    it('can derive automatic colors without changing the supplied override', () => {
        const face = { manaCost: ManaCost.parse('R'), colorOverride: ['g'] };
        const identity = ColorIdentity.fromCardFace(face, { includeOverride: false });
        expect(identity.colors.map(color => color.char)).toEqual(['r']);
        expect(face.colorOverride).toEqual(['g']);
        expect(colors(face)).toEqual(['g']);
    });

    it('uses mana cost rather than ability text for nonlands', () => {
        expect(colors({
            superType: 'Creature', manaCost: ManaCost.parse('1W'),
            rulesText: '{T}: Add {G}.'
        })).toEqual(['w']);
    });
});
