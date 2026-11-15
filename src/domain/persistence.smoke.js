import {
    createCard, createTestProject, deleteTestProject,
    expectCardData, expectFilesToMatch, flushCard,
    flushCardProperties, setCardFields, toggleFace
} from '../shared/testing/testUtils.js';
import YAMLSerializer from './projects/serializers/YAMLSerializer.js';
import platform from '../shared/platformAdapter.js';
import FieldInteractor, { CARD_PROPERTIES } from '../shared/testing/FieldInteractor.js';
import ImageCrop from './card/ImageCrop.js';
import { executeAction } from '../ui/systems/actionSystem.js';
import { CARD_CLIPBOARD_TYPE } from './card/cardClipboard.js';

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
        const projectFileExists = await platform.checkFileExists(project.filePath);
        expect(projectFileExists).toBeTrue();
    });

    describe('card fields', () => {
        it('persists a new card to the filesystem', async () => {
            const card = await createCard();
            await setCardFields({ name: 'Test' });
            await flushCard();
            const path = card.files.get('data');
            const exists = await platform.checkFileExists(path);
            expect(exists).toBeTrue();
            expect(path).toMatch(/cards\/Test.yml$/);
        });

        it('persists default card data', async () => {
            const card = await createCard();
            await setCardFields({ name: 'Test' });
            await setCardFields({ name: '' });
            await flushCard();
            const path = card.files.get('data');
            const data = await platform.readFile(path);
            expect(data).toEqualText(expectedBlankCardData);
        });

        it('persists multiple cards', async () => {
            const cardA = await createCard();
            await setCardFields({ name: 'Card A' });
            await flushCard();
            const pathA = cardA.files.get('data');
            const existsA = await platform.checkFileExists(pathA);
            expect(existsA).toBeTrue();
            expect(pathA).toMatch(/cards\/Card A.yml$/);

            const cardB = await createCard();
            await setCardFields({ name: 'Card B' });
            await flushCard();
            const pathB = cardB.files.get('data');
            const existsB = await platform.checkFileExists(pathB);
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
            const existsA = await platform.checkFileExists(pathA);
            expect(existsA).toBeTrue();
            expect(pathA).toMatch(/cards\/Card A.yml$/);

            const pathB = cardB.files.get('data');
            const existsB = await platform.checkFileExists(pathB);
            expect(existsB).toBeTrue();
            expect(pathB).toMatch(/cards\/Card B.yml$/);

            const pathC = cardC.files.get('data');
            const existsC = await platform.checkFileExists(pathC);
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
            const exists = await platform.checkFileExists(path);
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
            const exists = await platform.checkFileExists(path);
            expect(exists).toBeTrue();

            const path2 = card.files.get('back.artImage');
            const exists2 = await platform.checkFileExists(path2);
            expect(exists2).toBeTrue();
        });

        it('persists changes to an image', async () => {
            const card = await createCard();
            await setCardFields({ name: 'Garenbrig', artImage });
            await flushCard();
            await setCardFields({ artImage: artImage2 });
            await flushCard();

            const path = card.files.get('front.artImage');
            const bytes = await platform.readBinaryFile(path);
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

            const exists = await platform.checkFileExists(path);
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
            const existsA = await platform.checkFileExists(pathA);
            expect(existsA).toBeTrue();
            const bytesA = await platform.readBinaryFile(pathA);
            await expectFilesToMatch(new Blob([bytesA]), artImage);

            const pathB = cardB.files.get('front.artImage');
            const existsB = await platform.checkFileExists(pathB);
            expect(existsB).toBeTrue();
            const bytesB = await platform.readBinaryFile(pathB);
            await expectFilesToMatch(new Blob([bytesB]), artImage2);

            expect(pathA).not.toEqual(pathB);
        });
    });

    describe('renaming', () => {
        it('does not rename when name is changed but matches', async () => {
            const card = await createCard();
            await setCardFields({ name: 'Test:' });
            await flushCard();
            const pathBefore = card.files.get('data');

            await setCardFields({ name: 'Test/' });
            await flushCard();
            const pathAfter = card.files.get('data');

            expect(pathBefore).toEqual(pathAfter);
        });

        it('renames the card file when the card name changes', async () => {
            const card = await createCard();
            await setCardFields({ name: 'potato' });
            await flushCard();
            const pathBefore = card.files.get('data');

            await setCardFields({ name: 'fish' });
            await flushCard();
            const pathAfter = card.files.get('data');

            expect(pathBefore).not.toEqual(pathAfter);
            expect(pathAfter).toMatch(/fish.yml$/);
        });

        it('renames to a safe filename when a conflict exists', async () => {
            const cardA = await createCard();
            await setCardFields({ name: 'potato' });
            await flushCard();
            const pathA = cardA.files.get('data');

            const cardB = await createCard();
            await setCardFields({ name: 'fish' });
            await flushCard();
            const pathBefore = cardB.files.get('data');

            await setCardFields({ name: 'potato' });
            await flushCard();
            const pathAfter = cardB.files.get('data');

            expect(pathBefore).not.toEqual(pathAfter);
            expect(pathA).not.toEqual(pathAfter);
            expect(pathAfter).toMatch(/potato-2.yml$/);
        });

        it('renames card image files when the card name changes', async () => {
            const card = await createCard();
            await setCardFields({ name: 'potato', artImage });
            await flushCard();
            const pathBefore = card.files.get('front.artImage');

            await setCardFields({ name: 'fish' });
            await flushCard();
            const pathAfter = card.files.get('front.artImage');
            expect(pathBefore).not.toEqual(pathAfter);
            expect(pathAfter).toMatch(/fish.jpg$/);
        });
    });

    describe('removal', () => {
        it('removes the card data file when card is deleted', async () => {
            const card = await createCard();
            await setCardFields({ name: 'red dragon' });
            await flushCard();
            const path = card.files.get('data');
            await executeAction('delete-selected-cards');

            expect(path).toMatch(/red dragon.yml$/);
            const exists = await platform.checkFileExists(path);
            expect(exists).toBeFalse();
        });

        it('removes the card image files when card is deleted', async () => {
            const card = await createCard();
            await setCardFields({ name: 'red dragon', artImage });
            await flushCard();
            const path = card.files.get('front.artImage');
            await executeAction('delete-selected-cards');

            expect(path).toMatch(/red dragon.jpg$/);
            const exists = await platform.checkFileExists(path);
            expect(exists).toBeFalse();
        });

        it('removes the right files when a naming conflict exists', async () => {
            const cardA = await createCard();
            await setCardFields({ name: 'red dragon', artImage });
            await flushCard();
            const dataPathA = cardA.files.get('data');
            const imagePathA = cardA.files.get('front.artImage');

            const cardB = await createCard();
            await setCardFields({ name: 'blue dragon', artImage });
            await flushCard();
            await setCardFields({ name: 'red dragon' });
            await flushCard();
            const dataPathB = cardB.files.get('data');
            const imagePathB = cardB.files.get('front.artImage');

            await executeAction('delete-selected-cards');
            expect(await platform.checkFileExists(dataPathB)).toBeFalse();
            expect(await platform.checkFileExists(imagePathB)).toBeFalse();
            expect(await platform.checkFileExists(dataPathA)).toBeTrue();
            expect(await platform.checkFileExists(imagePathA)).toBeTrue();
            await executeAction('delete-selected-cards');
            expect(await platform.checkFileExists(dataPathA)).toBeFalse();
            expect(await platform.checkFileExists(imagePathA)).toBeFalse();

        });

        it('works with removing multiple cards at the same time', async () => {
            const cardA = await createCard();
            await setCardFields({ name: 'red dragon', artImage });
            await flushCard();
            const dataPathA = cardA.files.get('data');
            const imagePathA = cardA.files.get('front.artImage');

            const cardB = await createCard();
            await setCardFields({ name: 'blue dragon', artImage });
            await flushCard();
            const dataPathB = cardB.files.get('data');
            const imagePathB = cardB.files.get('front.artImage');

            const listView = document.querySelector('cm-list-view');
            listView.selection = [0, 1];
            await executeAction('delete-selected-cards');
            expect(await platform.checkFileExists(dataPathA)).toBeFalse();
            expect(await platform.checkFileExists(imagePathA)).toBeFalse();
            expect(await platform.checkFileExists(dataPathB)).toBeFalse();
            expect(await platform.checkFileExists(imagePathB)).toBeFalse();
        });

        it('does not create card files when a save was pending', async () => {
            const card = await createCard();
            await setCardFields({ name: 'green dragon', artImage });
            await flushCard();
            const dataPath = card.files.get('data');
            const imagePath = card.files.get('front.artImage');
            await setCardFields({ superType: 'creature' });
            const cardForm = document.querySelector('cm-card-form');
            const flush = cardForm.save.flush;
            await executeAction('delete-selected-cards');
            await flush();
            expect(await platform.checkFileExists(dataPath)).toBeFalse();
            expect(await platform.checkFileExists(imagePath)).toBeFalse();
        });
    });

    describe('copy/paste', () => {
        let clipboardItems;

        beforeAll(() => {
            spyOn(navigator.clipboard, 'write').and.callFake(async items => {
                clipboardItems = items;
                await Promise.all(items.flatMap(item => {
                    return item.types.map(type => item.getType(type));
                }));
            });

            spyOn(navigator.clipboard, 'read').and.callFake(async () => {
                return clipboardItems;
            });
        });

        beforeEach(() => {
            clipboardItems = [];
        });

        it('writes a rendered image and card snapshot', async () => {
            const card = await createCard();
            await setCardFields({ name: 'purple hippo', artImage });
            await flushCard();
            await executeAction('copy');

            expect(clipboardItems.length).toEqual(1);
            const item = clipboardItems[0];
            expect(item.types).toContain('image/png');
            expect(item.types).toContain(CARD_CLIPBOARD_TYPE);
            const image = await item.getType('image/png');
            expect(image.type).toEqual('image/png');
            expect(image.size).toBeGreaterThan(0);

            const cardData = await item.getType(CARD_CLIPBOARD_TYPE);
            expect(cardData.type).toEqual(CARD_CLIPBOARD_TYPE);
            const payload = JSON.parse(await cardData.text());
            expect(payload.cardFiles).toEqual(['purple hippo.yml']);
            const dataPath = await platform.getJoinedPath(
                payload.snapshotPath,
                payload.cardFiles[0]
            );
            const imagePath = await platform.getJoinedPath(
                payload.snapshotPath,
                'purple hippo.jpg'
            );
            expect(dataPath).not.toEqual(card.files.get('data'));
            expect(await platform.checkFileExists(dataPath)).toBeTrue();
            expect(await platform.checkFileExists(imagePath)).toBeTrue();
            const bytes = await platform.readBinaryFile(imagePath);
            await expectFilesToMatch(new Blob([bytes]), artImage);
        });

        it('places both faces next to each other in the rendered image', async () => {
            await createCard();
            await setCardFields({ name: 'front face' });
            await flushCard();
            await executeAction('copy');
            const frontImage = await clipboardItems[0].getType('image/png');
            const frontBitmap = await createImageBitmap(frontImage);

            await toggleFace('back');
            await setCardFields({ name: 'back face' }, { faceKey: 'back' });
            await flushCard();
            await executeAction('copy');

            const image = await clipboardItems[0].getType('image/png');
            const bitmap = await createImageBitmap(image);
            expect(bitmap.width).toEqual(frontBitmap.width * 2);
            expect(bitmap.height).toEqual(frontBitmap.height);
            frontBitmap.close();
            bitmap.close();
        });

        it('renders all selected cards in a grid', async () => {
            await createCard();
            await setCardFields({ name: 'one' });
            await flushCard();
            await executeAction('copy');
            const singleImage = await clipboardItems[0].getType('image/png');
            const singleBitmap = await createImageBitmap(singleImage);

            await createCard();
            await setCardFields({ name: 'two' });
            await createCard();
            await setCardFields({ name: 'three' });
            await flushCard();
            const listView = document.querySelector('cm-list-view');
            listView.selection = [0, 1, 2];
            await executeAction('copy');

            const image = await clipboardItems[0].getType('image/png');
            const bitmap = await createImageBitmap(image);
            expect(bitmap.width).toEqual(singleBitmap.width * 2);
            expect(bitmap.height).toEqual(singleBitmap.height * 2);
            singleBitmap.close();
            bitmap.close();
        });

        it('creates a new card', async () => {
            await createCard();
            await setCardFields({ name: 'purple hippo' });
            await flushCard();
            await executeAction('copy');
            await executeAction('paste');

            const path = selectedProjectCard.files.get('data');
            expect(await platform.checkFileExists(path)).toBeTrue();
            expect(path).toMatch(/purple hippo-2.yml$/);
        });

        it('can create multiple cards', async () => {
            await createCard();
            await setCardFields({ name: 'purple hippo' });
            await createCard();
            await setCardFields({ name: 'red rooster' });
            await flushCard();

            const listView = document.querySelector('cm-list-view');
            listView.selection = [0, 1];
            await executeAction('copy');
            await executeAction('paste');
            for (const card of activeProject.cards) {
                const path = card.files.get('data');
                expect(await platform.checkFileExists(path)).toBeTrue();
            }
        });

        it('saves image to a new file', async () => {
            await createCard();
            await setCardFields({ name: 'cheesestick', artImage });
            await flushCard();
            await executeAction('copy');
            await executeAction('paste');

            const files = selectedProjectCard.files;
            expect(files.has('front.artImage')).toBeTrue();
            const path = files.get('front.artImage');
            expect(await platform.checkFileExists(path)).toBeTrue();
            expect(path).toMatch(/cheesestick-2.jpg$/);
            const bytes = await platform.readBinaryFile(path);
            await expectFilesToMatch(new Blob([bytes]), artImage);
        });

        it('copies and pastes a card with its image before it is saved', async () => {
            await createCard();
            await setCardFields({ name: 'firebird', artImage });
            await executeAction('copy');
            await executeAction('paste');

            expect(activeProject.cards.length).toEqual(2);
            expect(activeProject.cards.map(card => card.front.name)).toEqual([
                'firebird',
                'firebird',
            ]);

            await flushCard();
            await activeProject.saveCards();
            const paths = activeProject.cards.map(card => {
                return card.files.get('front.artImage');
            });
            expect(new Set(paths).size).toEqual(2);
            for (const path of paths) {
                expect(await platform.checkFileExists(path)).toBeTrue();
                const bytes = await platform.readBinaryFile(path);
                await expectFilesToMatch(new Blob([bytes]), artImage);
            }
        });

        it('does not change pasted card when source is changed later', async () => {
            const card = await createCard();
            await setCardFields({ name: 'carrot' });
            await flushCard();
            await executeAction('copy');
            await executeAction('paste');
            const pastedCard = selectedProjectCard;

            await executeAction('select-card', card);
            await setCardFields({ superType: 'artifact', subType: 'food' });
            await flushCard();

            expect(pastedCard.front.superType).toEqual('');
            expect(pastedCard.front.subType).toEqual('');
            expect(card.front.superType).toEqual('artifact');
            expect(card.front.subType).toEqual('food');
        });

        it('does not change the source card when pasted card is changed', async () => {
            const card = await createCard();
            await setCardFields({ name: 'carrot' });
            await flushCard();
            await executeAction('copy');
            await executeAction('paste');
            const pastedCard = selectedProjectCard;
            await setCardFields({ superType: 'artifact', subType: 'food' });
            await flushCard();

            expect(card.front.superType).toEqual('');
            expect(card.front.subType).toEqual('');
            expect(pastedCard.front.superType).toEqual('artifact');
            expect(pastedCard.front.subType).toEqual('food');
        });

        it('creates a card with its image after source is removed', async () => {
            await createCard();
            await setCardFields({ name: 'carrot', artImage });
            await flushCard();
            await executeAction('copy');
            await executeAction('delete-selected-cards');
            await executeAction('paste');
            expect(selectedProjectCard).toBeDefined();

            const path = selectedProjectCard.files.get('data');
            expect(path).toMatch(/carrot.yml$/);
            expect(await platform.checkFileExists(path)).toBeTrue();
            const imagePath = selectedProjectCard.files.get('front.artImage');
            expect(await platform.checkFileExists(imagePath)).toBeTrue();
            const bytes = await platform.readBinaryFile(imagePath);
            await expectFilesToMatch(new Blob([bytes]), artImage);
        });

        it('works with copying a pasted card', async () => {
            await createCard();
            await setCardFields({ name: 'pumpkin king' });
            await flushCard();
            await executeAction('copy');
            await executeAction('paste');
            await executeAction('copy');
            await executeAction('paste');
            await executeAction('paste');

            expect(selectedProjectCard).toBeDefined();
            expect(activeProject.cards.length).toEqual(4);
            for (const card of activeProject.cards) {
                const path = card.files.get('data');
                expect(await platform.checkFileExists(path)).toBeTrue();
            }
        });
    });

    describe('duplicate', () => {
        it('creates independent card and image files', async () => {
            const source = await createCard();
            await setCardFields({ name: 'dragon', artImage });
            await flushCard();
            await executeAction('duplicate-selected-cards');

            const duplicate = selectedProjectCard;
            expect(duplicate).not.toBe(source);
            expect(duplicate.files.get('data')).toMatch(/dragon-2.yml$/);
            const imagePath = duplicate.files.get('front.artImage');
            expect(imagePath).toMatch(/dragon-2.jpg$/);
            expect(imagePath).not.toEqual(source.files.get('front.artImage'));
            const bytes = await platform.readBinaryFile(imagePath);
            await expectFilesToMatch(new Blob([bytes]), artImage);
        });

        it('persists duplicated cards and images', async () => {
            await createCard();
            await setCardFields({ name: 'phoenix', artImage });
            await executeAction('duplicate-selected-cards');

            expect(activeProject.cards.length).toEqual(2);
            expect(activeProject.cards.map(card => card.front.name)).toEqual([
                'phoenix',
                'phoenix',
            ]);

            await flushCard();
            await activeProject.saveCards();
            const paths = activeProject.cards.map(card => {
                return card.files.get('front.artImage');
            });
            expect(new Set(paths).size).toEqual(2);
            for (const path of paths)
                expect(await platform.checkFileExists(path)).toBeTrue();
        });
    });
});
