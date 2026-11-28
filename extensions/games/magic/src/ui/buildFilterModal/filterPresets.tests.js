import { useGame } from '../../../../../../src/shared/testing/gameFixture.js';

function preset(group, label) {
    return activeGame.filterPresets.find(entry => entry.label === group)
        .options.find(option => option.label === label).q;
}

function card(superType, rulesText, fields = {}) {
    const card = new activeGame.Card({ front: { superType, rulesText, ...fields } });
    card.updateKeywords(activeProject);
    return card;
}

describe('Magic filter presets', () => {
    useGame('magic');

    it('matches printed keywords, including quoted multiword keywords', () => {
        const printed = card('Creature', 'Trample, first strike');
        const granted = card('Instant', 'Target creature gains trample.');
        const cards = [printed, granted];
        expect(activeGame.filter(cards, preset('Keywords', 'Trample')))
            .toEqual([printed]);
        expect(activeGame.filter(cards, preset('Keywords', 'First strike')))
            .toEqual([printed]);
    });

    it('finds mana producers through the presets and direct produces queries', () => {
        const dork = card('Creature', '{T}: Add {G}.');
        const rock = card('Artifact', '{T}: Add one mana of any color.');
        const colorless = card('Artifact', '{T}: Add {C}{C}.');
        const land = card('Land', '', { subType: 'Forest Island' });
        const mixed = card('Land', '{T}: Add {C} or {W}.');
        const token = card('Artifact', 'Create a Treasure token.');
        const reminder = card('Creature', 'Flying (Reminder: Add {G}.)');
        const cards = [dork, rock, colorless, land, mixed, token, reminder];

        expect(activeGame.filter(cards, preset('Mana Production', 'Mana Dorks')))
            .toEqual([dork]);
        expect(activeGame.filter(cards, preset('Mana Production', 'Mana Rocks')))
            .toEqual([rock, colorless]);
        expect(activeGame.filter(cards, preset('Mana Production', 'Color Fixers')))
            .toEqual([rock, land]);
        expect(activeGame.filter(cards, 'produces>0 t:creature')).toEqual([dork]);
        expect(activeGame.filter(cards, 'produces:c')).toEqual([colorless, mixed]);
    });

    it('matches the draw and hard removal rules text presets', () => {
        const draw = card('Sorcery', 'Draw six cards.');
        const damage = card('Instant', 'CARDNAME deals 3 damage to any target.');
        const cards = [draw, damage];
        expect(activeGame.filter(cards, preset('Rules Text', 'Draws cards')))
            .toEqual([draw]);
        expect(activeGame.filter(cards, preset('Rules Text', 'Hard removal')))
            .toEqual([damage]);
    });
});
