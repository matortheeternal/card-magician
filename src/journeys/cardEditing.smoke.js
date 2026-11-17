import platform from '../shared/platformAdapter.js';
import FieldInteractor, { CARD_PROPERTIES } from '../shared/testing/FieldInteractor.js';
import ImageCrop from '../domain/card/ImageCrop.js';
import {
    createCard, createTestProject, deleteTestProject, expectCardData, flushCard,
    flushCardProperties, setCardFields, toggleFace
} from '../shared/testing/testUtils.js';
import { loadImageFixture, loadTextFixture } from '../shared/testing/steps/fixtures.js';
import { expectFileContent, readCardData } from '../shared/testing/steps/disk.js';
import { selectCard } from '../shared/testing/steps/cardList.js';
import { reopenProject } from '../shared/testing/steps/projects.js';

const RULES_TEXT = 'Flying\n\nIf a source you control would deal damage to an opponent, '
    + 'it deals double that damage instead.';

describe('Card editing', () => {
    let art, otherArt, blankCardData;

    beforeAll(async () => {
        art = await loadImageFixture('art.jpg');
        otherArt = await loadImageFixture('art2.jpg');
        blankCardData = await loadTextFixture('blank.yml');
    });

    beforeEach(async () => {
        await createTestProject();
    });

    afterEach(async () => {
        await deleteTestProject();
    });

    async function startBlankCard() {
        const card = await createCard();
        await setCardFields({ name: 'Test' });
        await setCardFields({ name: '' });
        await flushCard();
        expect(card.files.get('data')).toMatch(/cards\/blank.yml$/);
        const saved = await platform.readFile(card.files.get('data'));
        expect(saved).toEqualText(blankCardData);
        return card;
    }

    async function fillBothFaces() {
        await setCardFields({
            name: 'Sea Gate Restoration', manaCost: 'WUBRG', superType: 'Land',
            rulesText: RULES_TEXT, artImage: art
        });
        await setCardFields({ superType: 'Sorcery', subType: 'Lesson' });
        await toggleFace('back');
        await setCardFields(
            { name: 'Sea Gate, Reborn', artImage: art }, { faceKey: 'back' }
        );
        await setCardFields(
            { tags: ['tag-a', 'tag-b'], notes: 'test\nnotes\n\n123' },
            { mode: CARD_PROPERTIES }
        );
        await toggleFace('front');
        await flushCard();
        await flushCardProperties();
    }

    async function expectBothFacesSaved(card) {
        const data = await readCardData(card);
        expectCardData(data.front, {
            name: 'Sea Gate Restoration', manaCost: 'WUBRG', superType: 'Sorcery',
            subType: 'Lesson', rulesText: RULES_TEXT
        });
        expectCardData(data.back, { name: 'Sea Gate, Reborn' });
        expectCardData(data, { tags: ['tag-a', 'tag-b'], notes: 'test\nnotes\n\n123' });
        await expectFileContent(card.files.get('back.artImage'), art);
    }

    async function replaceAndCropFrontArt(card) {
        const field = new FieldInteractor('artImage', { faceKey: 'front' });
        await field.setValue(otherArt);
        await flushCard();
        await expectFileContent(card.files.get('front.artImage'), otherArt);
        field.fieldElement.setCrop(new ImageCrop(600, 400, 13, 26));
        await flushCard();
        const data = await readCardData(card);
        expectCardData(data.front.artImage.crop, {
            width: 600, height: 400, xOffset: 13, yOffset: 26
        });
    }

    async function clearFrontFace(card) {
        const imagePath = card.files.get('front.artImage');
        new FieldInteractor('artImage', { faceKey: 'front' }).clear();
        await setCardFields({
            name: '', manaCost: '', superType: '', subType: '', rulesText: ''
        });
        await flushCard();
        expect(await platform.checkFileExists(imagePath)).toBeFalse();
        expect(card.files.has('front.artImage')).toBeFalse();
        const data = await readCardData(card);
        expectCardData(data.front, {
            name: '', manaCost: '', superType: '', subType: '', rulesText: ''
        });
    }

    it('builds a two-faced card with art, tags and notes, and keeps it on disk',
       async () => {
           const card = await startBlankCard();
           await fillBothFaces();
           await expectBothFacesSaved(card);
           await expectFileContent(card.files.get('front.artImage'), art);
           await replaceAndCropFrontArt(card);

           const [reopened] = (await reopenProject()).cards;
           await expectBothFacesSaved(reopened);
           await expectFileContent(reopened.files.get('front.artImage'), otherArt);

           await selectCard(reopened);
           await clearFrontFace(reopened);
       }, 30000);

    it('keeps the current image source after saving and cropping', async () => {
        await createCard();
        const field = new FieldInteractor('artImage', { faceKey: 'front' });
        await field.setValue(art);
        const firstImageUrl = field.value.imageUrl;
        await flushCard();
        await field.setValue(otherArt);
        const currentImageUrl = field.value.imageUrl;
        expect(currentImageUrl).toMatch(/^blob:/);
        expect(currentImageUrl).not.toBe(firstImageUrl);
        await flushCard();

        const cardFace = document.querySelector('cm-display-card cm-card-face.front');
        const rendered = new Promise(resolve => {
            cardFace.shadowRoot.addEventListener(
                'RenderScheduler:flushed', resolve, { once: true }
            );
        });
        field.fieldElement.setCrop(new ImageCrop(600, 400, 13, 26));
        await rendered;
        await flushCard();

        expect(field.value.imageUrl).toBe(currentImageUrl);
        const cropImage = cardFace.shadowRoot.querySelector('crop-image');
        expect(cropImage.getAttribute('src')).toBe(currentImageUrl);
    });

    it('shows the last selected card when selections pile up during a save', async () => {
        const first = await createCard();
        const last = await createCard();
        const intermediate = await createCard();
        const cardList = document.querySelector('cm-card-list');
        await cardList.flushSelection();
        let releaseSave, saveStarted;
        const saveGate = new Promise(resolve => { releaseSave = resolve; });
        const started = new Promise(resolve => { saveStarted = resolve; });
        const form = document.querySelector('cm-card-form');
        const save = form.save;
        form.save = Object.assign((...args) => save(...args), {
            flush: async () => {
                saveStarted();
                await saveGate;
                await save.flush();
            },
            cancel: () => save.cancel()
        });
        const displayed = [];
        spyOn(cardList, 'updateStatus').and.callFake(() => {
            displayed.push(window.selectedProjectCard);
        });
        try {
            cardList.listView.revealRow(first);
            await started;
            cardList.listView.revealRow(intermediate);
            cardList.listView.revealRow(last);
            const settled = cardList.flushSelection();
            expect(window.selectedProjectCard).toBe(intermediate);
            releaseSave();
            await settled;
            expect(window.selectedProjectCard).toBe(last);
            expect(displayed).toEqual([last]);
        } finally {
            releaseSave();
            await cardList.flushSelection();
            form.save = save;
        }
    });
});
