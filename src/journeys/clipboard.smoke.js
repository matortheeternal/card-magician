import platform from '../shared/platformAdapter.js';
import { CARD_CLIPBOARD_TYPE } from '../domain/card/cardClipboard.js';
import {
    createCard, createTestProject, deleteTestProject, flushCard, setCardFields,
    toggleFace
} from '../shared/testing/testUtils.js';
import { loadImageFixture } from '../shared/testing/steps/fixtures.js';
import { useFakeClipboard } from '../shared/testing/steps/clipboard.js';
import {
    cardFilePaths, expectFileContent, expectFilesExist
} from '../shared/testing/steps/disk.js';
import {
    addNamedCard, selectCard, selectCards
} from '../shared/testing/steps/cardList.js';
import {
    copy, deleteSelectedCards, duplicateSelectedCards, paste, redo, undo
} from '../shared/testing/steps/editMenu.js';

describe('Clipboard', () => {
    const clipboard = useFakeClipboard();
    let art;

    beforeAll(async () => {
        art = await loadImageFixture('art.jpg');
    });

    beforeEach(async () => {
        await createTestProject();
    });

    afterEach(async () => {
        await flushCard();
        await deleteTestProject();
    });

    async function copiedImage() {
        const [item] = clipboard.items;
        return createImageBitmap(await item.getType('image/png'));
    }

    async function expectCopiedSnapshot(card) {
        expect(clipboard.items.length).toBe(1);
        const [item] = clipboard.items;
        expect(item.types).toContain('image/png');
        expect(item.types).toContain(CARD_CLIPBOARD_TYPE);
        const image = await copiedImage();
        expect([image.width, image.height]).toEqual([750, 1046]);
        image.close();

        const cardData = await item.getType(CARD_CLIPBOARD_TYPE);
        const { cardFiles, snapshotPath } = JSON.parse(await cardData.text());
        expect(cardFiles).toEqual(['carrot.yml']);
        const dataPath = await platform.getJoinedPath(snapshotPath, 'carrot.yml');
        const imagePath = await platform.getJoinedPath(snapshotPath, 'carrot.jpg');
        expect(dataPath).not.toEqual(card.files.get('data'));
        await expectFilesExist([dataPath]);
        await expectFileContent(imagePath, art);
    }

    async function expectPastedCopy(name) {
        const card = selectedProjectCard;
        expect(card.files.get('data')).toMatch(new RegExp(`${name}.yml$`));
        expect(card.files.get('front.artImage')).toMatch(new RegExp(`${name}.jpg$`));
        await expectFilesExist([card.files.get('data')]);
        await expectFileContent(card.files.get('front.artImage'), art);
        return card;
    }

    async function editIndependently(source, pasted) {
        await setCardFields({ superType: 'Artifact', subType: 'Food' });
        await flushCard();
        expect(source.front.superType).toBe('');
        await selectCard(source);
        await setCardFields({ superType: 'Creature' });
        await flushCard();
        expect(pasted.front.superType).toBe('Artifact');
        expect(pasted.front.subType).toBe('Food');
    }

    async function pasteAfterSourceIsRemoved(card) {
        await selectCard(card);
        await copy();
        await deleteSelectedCards();
        await paste();
        expect(selectedProjectCard.front.name).toBe('carrot');
        await expectFileContent(selectedProjectCard.files.get('front.artImage'), art);
    }

    async function pasteSeveralAsOneStep() {
        const cards = activeProject.cards.slice(0, 2);
        selectCards(cards);
        await copy();
        const before = [...activeProject.cards];
        await paste();
        const copies = activeProject.cards.slice(before.length);
        expect(copies.length).toBe(2);
        await expectFilesExist(copies.map(card => card.files.get('data')));
        await undo();
        expect(activeProject.cards).toEqual(before);
        await redo();
        expect(activeProject.cards).toEqual([...before, ...copies]);
    }

    async function duplicateIndependently(source) {
        await selectCard(source);
        await duplicateSelectedCards();
        const duplicate = selectedProjectCard;
        expect(duplicate).not.toBe(source);
        expect(duplicate.files.get('front.artImage'))
            .not.toEqual(source.files.get('front.artImage'));
        await expectFileContent(duplicate.files.get('front.artImage'), art);

        const pair = [source, duplicate];
        selectCards(pair);
        const before = [...activeProject.cards];
        await duplicateSelectedCards();
        expect(activeProject.cards.length).toBe(before.length + 2);
        await undo();
        expect(activeProject.cards).toEqual(before);
    }

    it('copies, pastes and duplicates cards independently of their source', async () => {
        const source = await addNamedCard('carrot', { artImage: art });
        await copy();
        await expectCopiedSnapshot(source);
        await paste();
        const pasted = await expectPastedCopy('carrot-2');
        await editIndependently(source, pasted);

        await selectCard(pasted);
        await copy();
        await paste();
        await paste();
        expect(activeProject.cards.length).toBe(4);
        await expectFilesExist(cardFilePaths(activeProject.cards));

        await pasteSeveralAsOneStep();
        await duplicateIndependently(source);
        await pasteAfterSourceIsRemoved(pasted);
    }, 30000);

    it('copies, pastes and duplicates a card before it is saved', async () => {
        await createCard();
        await setCardFields({ name: 'firebird', artImage: art });
        await copy();
        await paste();
        await duplicateSelectedCards();
        expect(activeProject.cards.map(card => card.front.name))
            .toEqual(['firebird', 'firebird', 'firebird']);
        await flushCard();
        await activeProject.saveCards();
        const images = activeProject.cards.map(card => card.files.get('front.artImage'));
        expect(new Set(images).size).toBe(3);
        for (const image of images) await expectFileContent(image, art);
    });

    it('renders copied faces side by side and selected cards in a grid', async () => {
        await addNamedCard('one');
        await copy();
        const single = await copiedImage();

        await toggleFace('back');
        await setCardFields({ name: 'back face' }, { faceKey: 'back' });
        await flushCard();
        await copy();
        const faces = await copiedImage();
        expect([faces.width, faces.height]).toEqual([single.width * 2, single.height]);

        await addNamedCard('two');
        await addNamedCard('three');
        await addNamedCard('four');
        selectCards(activeProject.cards.slice(1));
        await copy();
        const grid = await copiedImage();
        expect([grid.width, grid.height]).toEqual([single.width * 2, single.height * 2]);
        for (const image of [single, faces, grid]) image.close();
    });
});
