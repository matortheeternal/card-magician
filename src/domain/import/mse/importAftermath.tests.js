import { importCard } from './importMse.js';
import { useGame } from '../../../shared/testing/gameFixture.js';
import ImageFieldValue from '../../card/ImageFieldValue.js';

const cutRibbons = {
    name: 'Cut', casting_cost: '1R', card_color: 'red', super_type: 'Sorcery',
    rule_text: 'Cut deals 4 damage to target creature.',
    name_2: 'Ribbons', casting_cost_2: 'XBB', card_color_2: 'black',
    super_type_2: 'Sorcery',
    rule_text_2: '<kw-a><nospellcheck>Aftermath</nospellcheck></kw-a>\n'
        + 'Each opponent loses X life.',
    rarity: 'rare', illustrator: 'Raymond Swanland', illustrator_2: 'Someone Else',
    notes: 'AKH 223'
};

async function importAftermath(mseCard, adapter = {}) {
    const failures = [];
    const card = await importCard({ stylesheet: 'm15-aftermath' }, mseCard, adapter,
                                  error => failures.push(error.message));
    expect(failures).toEqual([]);
    return card;
}

describe('MSE aftermath import', () => {
    useGame('magic');

    it('imports each half into the aftermath template', async () => {
        const card = await importAftermath(cutRibbons);
        const { top, bottom } = card.front;
        expect(card.front.template).toBe('magic/M15/Aftermath');
        expect(card.notes).toBe('AKH 223');
        expect([top.name, bottom.name]).toEqual(['Cut', 'Ribbons']);
        expect(top.manaCost.toString()).toBe('1R');
        expect(bottom.manaCost.toString()).toBe('XBB');
        expect(bottom.superType).toBe('Sorcery');
        expect(bottom.rulesText).toBe('Aftermath\nEach opponent loses X life.');
        expect(top.colors.map(color => color.char)).toEqual(['r']);
        expect(bottom.colors.map(color => color.char)).toEqual(['b']);
    });

    it('keeps shared fields on the card face', async () => {
        const { front } = await importAftermath(cutRibbons);
        expect(front.rarity).toBe('rare');
        expect(front.illustrator).toBe('Raymond Swanland');
        expect(front.top.illustrator).toBeUndefined();
        expect(front.bottom.illustrator).toBeUndefined();
    });

    it('imports centered text separately for each half', async () => {
        const { front } = await importAftermath({
            ...cutRibbons, has_styling: 'true',
            styling_data: { center_text_1: 'always', center_text_2: 'short text only' }
        });
        expect(front.top.centerText).toBe('always');
        expect(front.bottom.centerText).toBe('short');
    });

    it('imports the art of each half into that half', async () => {
        spyOn(ImageFieldValue, 'fromFile').and.callFake(async blob => ({ blob }));
        const adapter = { getImage: async name => `${name} blob` };
        const { front } = await importAftermath({
            ...cutRibbons, image: 'top.png', image_2: 'bottom.png'
        }, adapter);
        expect(front.top.artImage).toEqual({ blob: 'top.png blob' });
        expect(front.bottom.artImage).toEqual({ blob: 'bottom.png blob' });
        expect(front.artImage).toBeUndefined();
    });
});
