import { useGame } from '../../../../../../src/shared/testing/gameFixture.js';
import { CARD_INSPECTIONS } from './cardInspections.js';
import InspectionOverrides from './InspectionOverrides.js';

function inspectionById(id) {
    return CARD_INSPECTIONS.find(inspection => inspection.id === id);
}

function card(front, back) {
    const result = back ? { front, back } : { front };
    for (const face of [front, back].filter(Boolean)) face.parent = () => result;
    return result;
}

function findings(id, cards, project = {}) {
    return inspectionById(id).inspect(cards, project);
}

function flagged(id, face) {
    return findings(id, [card(face)]).length > 0;
}

function creature(fields = {}) {
    const base = { name: 'Bear', superType: 'Creature', power: '2', toughness: '2' };
    return { ...base, rarity: 'common', ...fields };
}

function rules(rulesText, fields = {}) {
    return creature({ rulesText, ...fields });
}

function cost(manaCost) {
    return { superType: 'Instant', rulesText: 'Draw a card.', manaCost };
}

describe('Card inspections', () => {
    useGame('magic');

    it('have unique ids and a category', () => {
        const ids = CARD_INSPECTIONS.map(inspection => inspection.id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(CARD_INSPECTIONS.every(inspection => inspection.category)).toBeTrue();
    });

    it('require an artist credit only on cards with art', () => {
        const art = creature({ artImage: { imageUrl: 'art.png' } });
        expect(flagged('missing-artist-credit', art)).toBeTrue();
        expect(flagged('missing-artist-credit', creature())).toBeFalse();
        const credited = { ...art, illustrator: 'Rebecca' };
        expect(flagged('missing-artist-credit', credited)).toBeFalse();
        const project = { illustrator: 'Studio' };
        expect(findings('missing-artist-credit', [card(art)], project)).toEqual([]);
    });

    it('flag noncreature, nonland cards without rules text', () => {
        expect(flagged('missing-rules-text', { superType: 'Artifact' })).toBeTrue();
        expect(flagged('missing-rules-text', { superType: 'Enchantment' })).toBeTrue();
        expect(flagged('missing-rules-text', creature())).toBeFalse();
        expect(flagged('missing-rules-text', { superType: 'Land' })).toBeFalse();
    });

    it('flag missing creature stats and loyalty', () => {
        const statless = creature({ toughness: '' });
        expect(flagged('missing-creature-stats', statless)).toBeTrue();
        expect(flagged('missing-creature-stats', creature())).toBeFalse();
        const walker = { superType: 'Planeswalker' };
        expect(flagged('missing-loyalty', walker)).toBeTrue();
        expect(flagged('missing-loyalty', { ...walker, loyalty: '3' })).toBeFalse();
    });

    it('skip archetype and ad cards', () => {
        const ad = { superType: 'Artifact', rarity: 'ad' };
        expect(findings('missing-rules-text', [card(ad)])).toEqual([]);
    });

    it('quote outdated wordings with their replacement', () => {
        const etb = rules('When this enters the battlefield, draw a card.');
        const [finding] = findings('wording-enters-the-battlefield', [card(etb)]);
        expect(finding.message).toContain('enters the battlefield');
        const dies = rules('When this is put into a graveyard from the battlefield, '
            + 'draw a card.');
        expect(flagged('wording-put-into-graveyard', dies)).toBeTrue();
        expect(flagged('wording-converted-mana-cost', rules('Draw a card.'))).toBeFalse();
    });

    it('flag nonlegendary self-reference by name or macro', () => {
        const named = rules('When Bear enters, draw a card.');
        expect(flagged('wording-self-reference', named)).toBeTrue();
        const macro = rules('When CARDNAME enters, draw a card.');
        expect(flagged('wording-self-reference', macro)).toBeTrue();
        const legend = { ...named, superType: 'Legendary Creature' };
        expect(flagged('wording-self-reference', legend)).toBeFalse();
        const modern = rules('When this creature enters, draw a card.');
        expect(flagged('wording-self-reference', modern)).toBeFalse();
    });

    it('flag unrecognized rules text', () => {
        expect(flagged('unrecognized-text', rules('Invent the moon.'))).toBeTrue();
        expect(flagged('unrecognized-text', rules('Flying'))).toBeFalse();
    });

    it('check reminder text against keyword familiarity', () => {
        expect(flagged('missing-reminder-text', rules('Prowess'))).toBeTrue();
        expect(flagged('missing-reminder-text', rules('Flying'))).toBeFalse();
        const rare = rules('Prowess', { rarity: 'rare' });
        expect(flagged('missing-reminder-text', rare)).toBeFalse();
        const explained = rules('Flying (This creature can\'t be blocked except by '
            + 'creatures with flying or reach.)');
        expect(flagged('unneeded-reminder-text', explained)).toBeTrue();
    });

    it('limit rules text length by rarity', () => {
        const wordy = Array(60).fill('Draw a card.').join(' ');
        expect(flagged('wordy-for-rarity', rules(wordy))).toBeTrue();
        const mythic = rules(wordy, { rarity: 'mythic' });
        expect(flagged('wordy-for-rarity', mythic)).toBeFalse();
    });

    it('flag showy mana costs', () => {
        expect(flagged('mixed-hybrid-pips', cost('{W/U}{B/R}'))).toBeTrue();
        expect(flagged('mixed-hybrid-pips', cost('{W/U}{W/U}'))).toBeFalse();
        expect(flagged('multicolor-phyrexian', cost('{H/W}{H/U}'))).toBeTrue();
        expect(flagged('multicolor-phyrexian', cost('{H/W}{H/W}'))).toBeFalse();
        expect(flagged('many-mana-symbol-types', cost('{H/W}{W/U}{2/B}'))).toBeTrue();
        expect(flagged('many-mana-symbol-types', cost('{2}{W}{W/U}'))).toBeFalse();
    });

    it('flag activation costs outside the card colors', () => {
        const red = { manaCost: '{1}{R}' };
        const blue = rules('{U}, {T}: Draw a card.', red);
        expect(flagged('off-color-activation', blue)).toBeTrue();
        const own = rules('{1}{R}, {T}: Draw a card.', red);
        expect(flagged('off-color-activation', own)).toBeFalse();
        const overridden = { ...blue, colorOverride: ['u'] };
        expect(flagged('off-color-activation', overridden)).toBeFalse();
    });

    it('flag duplicate names outside tokens and basic lands', () => {
        const forest = { name: 'Forest', superType: 'Basic Land' };
        const cards = [
            card(creature()), card(creature({ name: ' bear ' })),
            card(creature({ superType: 'Token Creature' })),
            card({ ...forest }), card({ ...forest })
        ];
        const result = findings('duplicate-names', cards);
        expect(result.map(finding => finding.card)).toEqual(cards.slice(0, 2));
    });

    it('flag created tokens without a token card', () => {
        const maker = card(rules('When this creature enters, create a 1/1 white '
            + 'Spirit creature token with flying and a Treasure token.'));
        const spirit = card({
            name: 'Spirit', superType: 'Token Creature', subType: 'Spirit'
        });
        const messages = cards => findings('missing-token-cards', cards)
            .map(finding => finding.message);
        expect(messages([maker]).length).toBe(2);
        const treasure = jasmine.stringContaining('Treasure');
        expect(messages([maker, spirit])).toEqual([treasure]);
    });
});

describe('Inspection overrides', () => {
    const inspections = [{ id: 'loud' }, { id: 'quiet', enabledByDefault: false }];

    it('apply default enablement until overridden', () => {
        const project = {};
        const overrides = new InspectionOverrides(project, inspections);
        expect([...overrides.disabledIds]).toEqual(['quiet']);
        overrides.setEnabled(['loud', 'quiet'], true);
        expect(project.inspectionOverrides).toEqual({ quiet: { disabled: false } });
        expect([...overrides.disabledIds]).toEqual([]);
        overrides.setEnabled(['quiet'], false);
        expect(project.inspectionOverrides).toBeUndefined();
    });
});
