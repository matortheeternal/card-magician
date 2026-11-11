import { buildCardFace } from './domain/card/cardBuilder.js';
import {
    createCard, createTestProject, deleteTestProject, flushCard, setCardFields
} from './shared/testing/testUtils.js';
import FieldInteractor from './shared/testing/FieldInteractor.js';
import ImageCrop from './domain/card/ImageCrop.js';
import { executeAction } from './ui/systems/actionSystem.js';

describe('Rendering', () => {
    let artImage, artImage2;

    beforeAll(async () => {
        let response = await fetch('/tests/fixtures/art.jpg');
        let blob = await response.blob();
        artImage = new File([blob], '', { type: 'image/jpg' });
        response = await fetch('/tests/fixtures/art2.jpg');
        blob = await response.blob();
        artImage2 = new File([blob], '', { type: 'image/jpg' });
    });

    beforeEach(async () => {
        await createTestProject();
    });

    afterAll(async () => {
        await deleteTestProject();
    });

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

    it('keeps the current image source after saving and cropping', async () => {
        await createCard();
        const interactor = new FieldInteractor('artImage', { faceKey: 'front' });
        await interactor.setValue(artImage);
        const firstImageUrl = interactor.value.imageUrl;
        await flushCard();

        await interactor.setValue(artImage2);
        const currentImageUrl = interactor.value.imageUrl;
        expect(currentImageUrl).toMatch(/^blob:/);
        expect(currentImageUrl).not.toBe(firstImageUrl);
        await flushCard();

        const cardFace = document.querySelector(
            'cm-display-card cm-card-face.front'
        );
        const rendered = new Promise(resolve => {
            cardFace.shadowRoot.addEventListener(
                'RenderScheduler:flushed',
                resolve,
                { once: true }
            );
        });
        interactor.fieldElement.setCrop(new ImageCrop(600, 400, 13, 26));
        await rendered;
        await flushCard();

        expect(interactor.value.imageUrl).toBe(currentImageUrl);
        const cropImage = cardFace.shadowRoot.querySelector('crop-image');
        expect(cropImage.getAttribute('src')).toBe(currentImageUrl);
    });
    it('copies a rendered card as a decodable PNG', async () => {
        await createCard();
        await setCardFields({ name: 'PNG smoke card', artImage });
        await flushCard();
        await navigator.clipboard.writeText('');
        await executeAction('copy');
        const items = await navigator.clipboard.read();
        const item = items.find(item => item.types.includes('image/png'));
        expect(item).toBeDefined();
        const blob = await item.getType('image/png');
        const image = await createImageBitmap(blob);
        expect(image.width).toBe(750);
        expect(image.height).toBe(1046);
        image.close();
    });

});
