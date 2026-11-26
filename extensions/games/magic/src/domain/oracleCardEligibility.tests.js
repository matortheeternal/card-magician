import { autodetectMechanics } from './projectMechanics.js';
import OracleAssistance from './OracleAssistance.js';

const ARCHETYPE = 'magic/M20/Archetypes';

describe('Oracle card exclusions', () => {
    it('excludes Archetypes and Ad cards from scanning either face', () => {
        const cards = [
            { name: 'Archetype', front: {
                template: ARCHETYPE, rulesText: 'Mistsong (Draw a card.)'
            } },
            { name: 'Ad', front: { rulesText: 'Glimmer (Draw a card.)' },
                back: { rarity: 'ad' } },
            { name: 'Playable', front: { rulesText: 'Windcall (Draw a card.)' } }
        ];
        const entries = autodetectMechanics({ cards }, null, []);
        expect(entries.map(entry => entry.definition.name)).toEqual(['Windcall']);
    });

    it('skips tag suggestions and diagnostics for both sides of excluded cards', () => {
        const assistance = new OracleAssistance();
        const card = { front: { rulesText: 'Draw a card.' }, back: { rarity: 'ad' } };
        card.front.parent = () => card;
        const editor = document.createElement('div');
        editor.textContent = 'Invent the moon.';
        const parse = spyOn(assistance, 'parse').and.callThrough();
        expect(assistance.suggestTags(card)).toEqual([]);
        assistance.highlightRules(editor, card.front);

        delete card.back.rarity;
        card.back.template = ARCHETYPE;
        expect(assistance.suggestTags(card)).toEqual([]);
        assistance.highlightRules(editor, card.front);
        expect(parse).not.toHaveBeenCalled();

        delete card.back.template;
        expect(assistance.suggestTags(card)).toContain('draw');
        assistance.highlightRules(editor, card.front);
        expect(editor.querySelector('.hljs-unrecognized')).not.toBeNull();
    });
});
