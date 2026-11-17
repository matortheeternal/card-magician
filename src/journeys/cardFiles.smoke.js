import platform from '../shared/platformAdapter.js';
import { CARD_PROPERTIES } from '../shared/testing/FieldInteractor.js';
import {
    createCard, createTestProject, deleteTestProject, flushCard, setCardFields,
    toggleFace
} from '../shared/testing/testUtils.js';
import { loadImageFixture } from '../shared/testing/steps/fixtures.js';
import {
    cardFilePaths, expectFileContent, expectFilesExist, expectFilesRemoved
} from '../shared/testing/steps/disk.js';
import {
    addNamedCard, selectCard, selectCards
} from '../shared/testing/steps/cardList.js';
import { deleteSelectedCards, redo, undo } from '../shared/testing/steps/editMenu.js';
import { reopenProject } from '../shared/testing/steps/projects.js';

describe('Card files', () => {
    let art, otherArt;

    beforeAll(async () => {
        art = await loadImageFixture('art.jpg');
        otherArt = await loadImageFixture('art2.jpg');
    });

    beforeEach(async () => {
        await createTestProject();
    });

    afterEach(async () => {
        await flushCard();
        await deleteTestProject();
    });

    async function addCardsBeforeSaving(names) {
        const cards = [];
        for (const name of names) {
            cards.push(await createCard());
            await setCardFields({ name });
        }
        await flushCard();
        for (const [index, card] of cards.entries()) {
            const expected = new RegExp(`cards/${names[index]}.yml$`);
            expect(card.files.get('data')).toMatch(expected);
        }
        await expectFilesExist(cards.map(card => card.files.get('data')));
        return cards;
    }

    async function addConflictingCards() {
        const first = await addNamedCard('Lightning Bolt', { artImage: art });
        await toggleFace('back');
        await setCardFields({ artImage: art }, { faceKey: 'back' });
        await toggleFace('front');
        await flushCard();
        const second = await addNamedCard('Lightning Bolt', { artImage: otherArt });
        expect(first.files.get('data')).toMatch(/Lightning Bolt.yml$/);
        expect(second.files.get('data')).toMatch(/Lightning Bolt-2.yml$/);
        expect(second.front.name).toBe('Lightning Bolt');
        await expectFileContent(first.files.get('front.artImage'), art);
        await expectFileContent(second.files.get('front.artImage'), otherArt);
    }

    async function renameUntilConflict() {
        const card = await addNamedCard('Test:', { artImage: art });
        const firstPath = card.files.get('data');
        await setCardFields({ name: 'Test/' });
        await flushCard();
        expect(card.files.get('data')).withContext('equivalent name').toBe(firstPath);

        const oldImagePath = card.files.get('front.artImage');
        await setCardFields({ name: 'fish' });
        await flushCard();
        expect(card.files.get('data')).toMatch(/fish.yml$/);
        expect(card.files.get('front.artImage')).toMatch(/fish.jpg$/);
        await expectFilesRemoved([firstPath, oldImagePath]);

        await setCardFields({ name: 'Card A' });
        await flushCard();
        expect(card.files.get('data')).toMatch(/Card A-2.yml$/);
        return card;
    }

    async function deleteWhileEditsArePending(card) {
        await selectCard(card);
        await setCardFields({ rulesText: 'Keep pending text' });
        await setCardFields({ notes: 'Keep pending notes' }, { mode: CARD_PROPERTIES });
        const dataPath = card.files.get('data');
        const pendingSave = document.querySelector('cm-card-form').save.flush;
        await deleteSelectedCards();
        await pendingSave();
        await expectFilesRemoved([dataPath]);

        await undo();
        expect(activeEditorCard.front.rulesText).toBe('Keep pending text');
        expect(card.notes).toBe('Keep pending notes');
        await expectFilesExist([card.files.get('data')]);
    }

    async function expectBoltArt(bolts) {
        const first = bolts.find(card => card.baseName === 'Lightning Bolt');
        const second = bolts.find(card => card.baseName === 'Lightning Bolt-2');
        await expectFileContent(first.files.get('front.artImage'), art);
        await expectFileContent(first.files.get('back.artImage'), art);
        await expectFileContent(second.files.get('front.artImage'), otherArt);
    }

    async function deleteAndRestoreLoadedCards() {
        const project = await reopenProject();
        const bolts = project.cards.filter(card => card.front.name === 'Lightning Bolt');
        await selectCard(bolts[1]);
        selectCards(bolts);
        const paths = cardFilePaths(bolts);
        await deleteSelectedCards();
        await expectFilesRemoved(paths);
        for (let replay = 0; replay < 2; replay++) {
            await undo();
            expect(project.cards.filter(card => bolts.includes(card))).toEqual(bolts);
            await expectBoltArt(bolts);
            await redo();
            await expectFilesRemoved(paths);
        }
        await undo();
        selectCards([]);
        await deleteSelectedCards();
        await redo();
        expect(project.cards.some(card => bolts.includes(card)))
            .withContext('redo survives an empty deletion').toBeFalse();
    }

    it('names, renames and removes card files as cards change', async () => {
        const [cardA, cardB] = await addCardsBeforeSaving(['Card A', 'Card B', 'Card C']);
        await addConflictingCards();

        const renamed = await renameUntilConflict();
        const renamedPaths = cardFilePaths([renamed]);
        await deleteSelectedCards();
        await expectFilesRemoved(renamedPaths);
        await expectFilesExist([cardA.files.get('data')]);

        await deleteWhileEditsArePending(cardB);
        await deleteAndRestoreLoadedCards();
    }, 30000);

    it('restores game-defined card files after undoing a deletion', async () => {
        const card = await addNamedCard('Attachment');
        card.files.definitions.push(new window.CardFileDefinition('attachment', {
            suffix: ' - Attachment', extension: '.bin'
        }));
        const path = await card.files.getCanonicalPath('attachment');
        const bytes = new Uint8Array([0, 1, 127, 255]);
        await platform.writeBinaryFile(path, bytes);
        await card.files.set('attachment', path);
        await deleteSelectedCards();
        await expectFilesRemoved([path]);
        await undo();
        const restored = await platform.readBinaryFile(card.files.get('attachment'));
        expect(new Uint8Array(restored)).toEqual(bytes);
    });
});
