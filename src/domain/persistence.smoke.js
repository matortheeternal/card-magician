import { checkFileExists } from '../shared/fsUtils.js';
import {
    createCard, createTestProject, deleteTestProject,
    expectCardData,
    expectFilesToMatch, flushCard, flushCardProperties, setCardFields, toggleFace
} from '../shared/testing/testUtils.js';
import YAMLSerializer from './projects/serializers/YAMLSerializer.js';
import { readBinaryFile, readFile } from '../shared/neutralinoAdapter.js';
import FieldInteractor, { CARD_PROPERTIES } from '../shared/testing/FieldInteractor.js';
import ImageCrop from './card/ImageCrop.js';

describe('Persistence', () => {
    let project;
    let expectedBlankCardData;
    let artImage, artImage2;

    beforeAll(async () => {
        let response = await fetch('/tests/fixtures/blank.yml');
        expectedBlankCardData = await response.text();
        response = await fetch('/tests/fixtures/art.jpg');
        let blob = await response.blob();
        artImage = new File([blob], '', { type: 'image/jpg' });
        response = await fetch('/tests/fixtures/art2.jpg');
        blob = await response.blob();
        artImage2 = new File([blob], '', { type: 'image/jpg' });
    });

    beforeEach(async () => {
        project = await createTestProject();
    });

    afterAll(async () => {
        await deleteTestProject();
    });

    it('saves the project file to the filesystem', async () => {
        expect(project.filePath).toMatch(/test.cmproj$/);
        await project.save();
        const projectFileExists = await checkFileExists(project.filePath);
        expect(projectFileExists).toBeTrue();
    });

    describe('card fields', () => {
        it('persists a new card to the filesystem', async () => {
            const card = await createCard();
            await setCardFields({ name: 'Test' });
            await flushCard();
            const path = card.files.get('data');
            const exists = await checkFileExists(path);
            expect(exists).toBeTrue();
            expect(path).toMatch(/cards\/Test.yml$/);
        });

        it('persists default card data', async () => {
            const card = await createCard();
            await setCardFields({ name: 'Test' });
            await setCardFields({ name: '' });
            await flushCard();
            const path = card.files.get('data');
            const data = await readFile(path);
            expect(data).toEqualText(expectedBlankCardData);
        });

        it('persists multiple cards', async () => {
            const cardA = await createCard();
            await setCardFields({ name: 'Card A' });
            await flushCard();
            const pathA = cardA.files.get('data');
            const existsA = await checkFileExists(pathA);
            expect(existsA).toBeTrue();
            expect(pathA).toMatch(/cards\/Card A.yml$/);

            const cardB = await createCard();
            await setCardFields({ name: 'Card B' });
            await flushCard();
            const pathB = cardB.files.get('data');
            const existsB = await checkFileExists(pathB);
            expect(existsB).toBeTrue();
            expect(pathB).toMatch(/cards\/Card B.yml$/);
        });

        it('persists changes to multiple fields', async () => {
            const card = await createCard();
            await setCardFields({ name: 'Test', manaCost: 'WUBRG' });
            await flushCard();
            const path = card.files.get('data');
            const data = await YAMLSerializer.load(path);
            expectCardData(data.front,  {
                name: 'Test',
                manaCost: 'WUBRG'
            });
        });

        it('persists the final value after multiple changes', async () => {
            const card = await createCard();
            await setCardFields({ name: 'Swamp', superType: 'Land' });
            await setCardFields({ superType: 'Basic Land', subType: 'Swamp' });
            await flushCard();
            const path = card.files.get('data');
            const data = await YAMLSerializer.load(path);
            expectCardData(data.front, {
                name: 'Swamp',
                superType: 'Basic Land',
                subType: 'Swamp',
            });
        });

        it('persists changing fields to empty values', async () => {
            const card = await createCard();
            await setCardFields({
                name: 'Twinflame Tyrant',
                manaCost: '3RR',
                superType: 'Creature',
                subType: 'Dragon',
                rulesText: 'Flying\n\nIf a source you control would deal damage to an '
                    + 'opponent or a permanent an opponent controls, it deals double '
                    + 'that damage instead.',
                flavorText: `"Job only paid enough for one head. I'm out."\n`
                    + `—Peren, veteran mercenary`
            });
            await flushCard();
            await setCardFields({
                name: '',
                manaCost: '',
                superType: '',
                subType: '',
                rulesText: '',
                flavorText: ''
            });
            await flushCard();
            const path = card.files.get('data');
            const data = await YAMLSerializer.load(path);
            expectCardData(data.front, {
                name: '',
                manaCost: '',
                superType: '',
                subType: '',
                rulesText: '',
                flavorText: '',
            });
        });

        it('persists front and back face fields', async () => {
            const card = await createCard();
            await setCardFields({ name: 'Sea Gate Restoration' });
            await toggleFace('back');
            await setCardFields(
                { name: 'Sea Gate, Reborn' },
                { faceKey: 'back' }
            );
            await flushCard();
            const path = card.files.get('data');
            const data = await YAMLSerializer.load(path);
            expectCardData(data.front, { name: 'Sea Gate Restoration' });
            expectCardData(data.back, { name: 'Sea Gate, Reborn' });
        });

        it('persists changes correctly when card changes before save', async () => {
            const cardA = await createCard();
            await setCardFields({ name: 'Card A' });
            const cardB = await createCard();
            await setCardFields({ name: 'Card B' });
            const cardC = await createCard();
            await setCardFields({ name: 'Card C' });
            await flushCard();

            const pathA = cardA.files.get('data');
            const existsA = await checkFileExists(pathA);
            expect(existsA).toBeTrue();
            expect(pathA).toMatch(/cards\/Card A.yml$/);

            const pathB = cardB.files.get('data');
            const existsB = await checkFileExists(pathB);
            expect(existsB).toBeTrue();
            expect(pathB).toMatch(/cards\/Card B.yml$/);

            const pathC = cardC.files.get('data');
            const existsC = await checkFileExists(pathC);
            expect(existsC).toBeTrue();
            expect(pathC).toMatch(/cards\/Card C.yml$/);
        });
    });

    describe('card properties', () => {
        it('persists card tags', async () => {
            const card = await createCard();
            await setCardFields(
                { tags: ['tag-a', 'tag-b'] },
                { mode: CARD_PROPERTIES }
            );
            await flushCardProperties();
            const path = card.files.get('data');
            const data = await YAMLSerializer.load(path);
            expectCardData(data, { tags: ['tag-a', 'tag-b'] });
        });

        it('persists card notes', async () => {
            const card = await createCard();
            await setCardFields(
                { notes: 'test\nnotes\n\n123' },
                { mode: CARD_PROPERTIES }
            );
            await flushCardProperties();
            const path = card.files.get('data');
            const data = await YAMLSerializer.load(path);
            expectCardData(data, { notes: 'test\nnotes\n\n123' });
        });
    });

    describe('file naming', () => {
        it('defaults empty name to "blank"', async () => {
            const card = await createCard();
            await setCardFields({ name: 'Test' });
            await setCardFields({ name: '' });
            await flushCard();
            const path = card.files.get('data');
            expect(path).toMatch(/blank.yml$/);
        });

        it('sanitizes filenames', async () => {
            const card = await createCard();
            await setCardFields({ name: '~/.\u0000ssh\\authorized_keys' });
            await flushCard();
            const path = card.files.get('data');
            expect(path).toMatch(/~-.-ssh-authorized_keys.yml$/);
        });

        it('sanitizes " - " in filenames', async () => {
            const card = await createCard();
            await setCardFields({ name: 'test - back' });
            await flushCard();
            const path = card.files.get('data');
            expect(path).toMatch(/test--back.yml$/);
        });

        it('handles filename conflicts without changing card names', async () => {
            const cardA = await createCard();
            await setCardFields({ name: 'Lightning Bolt' });
            await flushCard();
            const cardB = await createCard();
            await setCardFields({ name: 'Lightning Bolt' });
            await flushCard();

            const pathA = cardA.files.get('data');
            expect(pathA).toMatch(/Lightning Bolt.yml$/);
            const pathB = cardB.files.get('data');
            expect(pathB).toMatch(/Lightning Bolt-2.yml$/);
        });

        it('is case insensitive when handling naming conflicts', async () => {
            const cardA = await createCard();
            await setCardFields({ name: 'Lightning Bolt' });
            await flushCard();
            const cardB = await createCard();
            await setCardFields({ name: 'lightning bolt' });
            await flushCard();

            const pathA = cardA.files.get('data');
            expect(pathA).toMatch(/Lightning Bolt.yml$/);
            const pathB = cardB.files.get('data');
            expect(pathB).toMatch(/lightning bolt-2.yml$/);
        });
    });

    describe('images', () => {
        it('persists card image files', async () => {
            const card = await createCard();
            await setCardFields({ artImage });
            await flushCard();
            const path = card.files.get('front.artImage');
            const exists = await checkFileExists(path);
            expect(exists).toBeTrue();
        });

        it('persists front and back image files', async () => {
            const card = await createCard();
            await setCardFields({ name: 'Garenbrig', artImage });
            await toggleFace('back');
            await setCardFields(
                { name: 'Carver', artImage },
                { faceKey: 'back' }
            );
            await flushCard();
            const path = card.files.get('front.artImage');
            const exists = await checkFileExists(path);
            expect(exists).toBeTrue();

            const path2 = card.files.get('back.artImage');
            const exists2 = await checkFileExists(path2);
            expect(exists2).toBeTrue();
        });

        it('persists changes to an image', async () => {
            const card = await createCard();
            await setCardFields({ name: 'Garenbrig', artImage });
            await flushCard();
            await setCardFields({ artImage: artImage2 });
            await flushCard();

            const path = card.files.get('front.artImage');
            const bytes = await readBinaryFile(path);
            await expectFilesToMatch(new Blob([bytes]), artImage2);
        });

        it('persists image crops', async () => {
            const card = await createCard();
            const interactor = new FieldInteractor('artImage', { faceKey: 'front' });
            await interactor.setValue(artImage);
            const crop = new ImageCrop(600, 400, 13, 26);
            interactor.fieldElement.setCrop(crop);
            await flushCard();

            const path = card.files.get('data');
            const data = await YAMLSerializer.load(path);
            expectCardData(data.front?.artImage?.crop, {
                width: 600,
                height: 400,
                xOffset: 13,
                yOffset: 26
            });
        });

        it('removes image files when image is removed', async () => {
            const card = await createCard();
            const interactor = new FieldInteractor('artImage', { faceKey: 'front' });
            await interactor.setValue(artImage);
            await flushCard();
            const path = card.files.get('front.artImage');

            interactor.clear();
            await flushCard();

            const exists = await checkFileExists(path);
            expect(exists).toBeFalse();
            expect(card.files.has('front.artImage')).toBeFalse();
        });

        it('handles naming collisions', async () => {
            const cardA = await createCard();
            await setCardFields({ name: 'Garenbrig', artImage });
            await flushCard();

            const cardB = await createCard();
            await setCardFields({ name: 'Garenbrig', artImage: artImage2 });
            await flushCard();

            const pathA = cardA.files.get('front.artImage');
            const existsA = await checkFileExists(pathA);
            expect(existsA).toBeTrue();
            const bytesA = await readBinaryFile(pathA);
            await expectFilesToMatch(new Blob([bytesA]), artImage);

            const pathB = cardB.files.get('front.artImage');
            const existsB = await checkFileExists(pathB);
            expect(existsB).toBeTrue();
            const bytesB = await readBinaryFile(pathB);
            await expectFilesToMatch(new Blob([bytesB]), artImage2);

            expect(pathA).not.toEqual(pathB);
        });
    });

    describe('renaming', () => {
        it('does not rename when name is changed but matches', async () => {

        });

        it('renames the card file when the card name changes', async () => {

        });

        it('renames to a safe filename when a conflict exists', async () => {

        });

        it('renames card image files when the card name changes', async () => {

        });
    });

    describe('removal', () => {
        it('removes the card data file when card is deleted', async () => {

        });

        it('removes the card image files when card is deleted', async () => {

        });

        it('removes the right files when a naming conflict exists', async () => {

        });

        it('works with removing multiple cards at the same time', async () => {

        });

        it('does not rename cards named to avoid collisions', async () => {

        });

        it('does not recreate the card when a save was pending', async () => {

        });
    });

    describe('copy/paste', () => {
        it('creates a new card', async () => {

        });

        it('can create multiple cards', async () => {

        });

        it('copies all field values', async () => {

        });

        it('saves image to a new file', async () => {

        });

        it('does not change pasted card when source is changed later', async () => {

        });

        it('does not change the source card when pasted card is changed', async () => {

        });

        it('creates a card after source is removed', async () => {

        });

        it('works with copying a pasted card', async () => {

        });

        it('creates multiple independent cards on multiple pastes', async () => {

        });
    });
});
