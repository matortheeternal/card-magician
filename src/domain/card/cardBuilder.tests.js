import { resolveFaceTemplate } from '../template/templateRegistry.js';
import { buildCardFace } from './cardBuilder.js';
import { useGame } from '../../shared/testing/gameFixture.js';

describe('Card faces', () => {
    useGame('magic');

    it('initializes game traits before loading face and subcard modules', async () => {
        const initialize = activeGame.initializeCardFace;
        const initialized = [];
        spyOn(activeGame, 'initializeCardFace').and.callFake(face => {
            initialize.call(activeGame, face);
            expect(face.modules).toEqual([]);
            expect(face.isLand()).toBeFalse();
            expect(face.hasNoText()).toBeTrue();
            const symbols = face.parseSymbols('{W}');
            expect(face.symbolsToHTML(symbols))
                .toContain('/assets/symbols/flat/single/w.png');
            expect(face.resolveColorSymbolIcon('w'))
                .toContain('/assets/symbols/flat/single/w.png');
            expect(Object.keys(face)).not.toContain('parseSymbols');
            initialized.push(face);
        });
        const card = {
            front: {
                template: 'magic/M15/Adventure', superType: 'Legendary Creature',
                rulesText: 'Companion — Draw a card.',
                adventure: { superType: 'Sorcery', rulesText: '- Draw.\n- Scry.' }
            },
            back: { template: 'magic/M15/Main', superType: 'Land', subType: 'Forest' }
        };
        const front = await buildCardFace(card, 'front');
        const back = await buildCardFace(card, 'back');
        try {
            expect(initialized).toEqual([front, front.adventure, back]);
            expect(front.isLegendary()).toBeTrue();
            expect(front.isCompanion()).toBeTrue();
            expect(front.adventure.isCreature()).toBeFalse();
            expect(front.adventure.hasChoices()).toBeTrue();
            expect(back.isLand()).toBeTrue();
            expect(Object.keys(front)).not.toContain('isLegendary');
            expect(Object.keys(front.adventure)).not.toContain('hasChoices');
            expect((await front.save()).isLegendary).toBeUndefined();
        } finally {
            front.dispose();
            back.dispose();
        }
    });

    it('matches Auto within the project family and falls back to its default', () => {
        const saga = { template: 'auto', superType: 'Enchantment', subType: 'Saga' };
        const classic = { preferredTemplateFamily: 'Classic' };
        const resolve = (face, project) =>
            resolveFaceTemplate(face, activeGame, project).id;
        expect(resolve(saga, {})).toBe('magic/M15/Saga');
        expect(resolve(saga, classic)).toBe('magic/Classic/Saga');
        expect(resolve({ template: 'auto', superType: 'Creature' }, classic))
            .toBe('magic/Classic/Main');
        expect(resolve({ template: 'magic/M15/Saga' }, classic)).toBe('magic/M15/Saga');
        expect(resolve(saga, { preferredTemplateFamily: 'Spotlight' }))
            .toBe('magic/M15/Saga');
    });

    it('reads previous Ixalan Map IDs and saves the canonical Spotlight ID', async () => {
        for (const template of ['magic/M15/Map', 'M15Map']) {
            const card = { front: { template } };
            const face = await buildCardFace(card, 'front');
            try {
                expect(face.resolvedTemplate.id).toBe('magic/Spotlight/Map');
                expect((await face.save()).template).toBe('magic/Spotlight/Map');
            } finally {
                face.dispose();
            }
        }
    });

    it('renders short Saga text when optional flavor text is null', async () => {
        const face = await buildCardFace({ front: {
            template: 'magic/M15/Saga', centerText: 'short', rulesText: 'I — Draw.',
        } }, 'front');
        try {
            const text = face.modules.find(module => module.name === 'SagaText');
            expect(face.flavorText).toBeNull();
            await text.renderPreHTML(face);
            await text.renderPostHTML(face);
            expect(text.renderPreText(face)).toContain('text-align: center');
            expect(text.renderPostText(face)).toContain('text-align: center');
            expect(text.render(face)).toContain('text-align: center');
            face.flavorText = 'Some flavor text.';
            expect(text.renderPreText(face)).not.toContain('text-align: center');
        } finally {
            face.dispose();
        }
    });

    it('handles missing rules text and preserves text-centering options', async () => {
        const face = await buildCardFace({ front: { template: 'magic/M15/Main' } },
                                         'front');
        try {
            const text = face.modules.find(module => module.name === 'Text');
            expect(text.shouldCenter({ centerText: 'short', rulesText: null,
                flavorText: null })).toBeTrue();
            expect(text.shouldCenter({ centerText: 'short' })).toBeTrue();
            expect(text.shouldCenter({
                centerText: 'short', rulesText: '123456789012345'
            })).toBeFalse();
            expect(text.shouldCenter({ centerText: 'never' })).toBeFalse();
            expect(text.shouldCenter({ centerText: 'always', flavorText: 'Flavor' }))
                .toBeTrue();
        } finally {
            face.dispose();
        }
    });
});
