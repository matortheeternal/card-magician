import {
    createCard, createTestProject, deleteTestProject, flushCard
} from './shared/testing/testUtils.js';
import FieldInteractor from './shared/testing/FieldInteractor.js';
import ImageCrop from './domain/card/ImageCrop.js';

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
});
