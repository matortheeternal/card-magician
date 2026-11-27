import * as history from '../ui/systems/historySystem.js';
import platform from '../shared/platformAdapter.js';
import FieldInteractor from '../shared/testing/FieldInteractor.js';
import ImageCrop from '../domain/card/ImageCrop.js';
import ImageFieldValue from '../domain/card/ImageFieldValue.js';
import {
    createCard, createTestProject, deleteTestProject, flushCard, setCardFields,
    toggleFace
} from '../shared/testing/testUtils.js';
import { loadImageFixture } from '../shared/testing/steps/fixtures.js';
import {
    expectFileContent, expectFilesExist, expectFilesRemoved, readCardData
} from '../shared/testing/steps/disk.js';
import {
    addNamedCard, dropImages, selectCard, selectCards, selectedCards, sortCardsBy,
    visibleCards
} from '../shared/testing/steps/cardList.js';
import {
    deleteSelectedCards, filterCards, redo, undo
} from '../shared/testing/steps/editMenu.js';
import { reopenProject } from '../shared/testing/steps/projects.js';

function deferred() {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    return { promise, resolve };
}

describe('Undo and redo', () => {
    let art, otherArt;

    beforeAll(async () => {
        art = await loadImageFixture('art.jpg');
        otherArt = await loadImageFixture('art2.jpg');
    });

    beforeEach(async () => {
        await createTestProject();
        await history.reset();
    });

    afterEach(async () => {
        await flushCard();
        await history.reset();
        await deleteTestProject();
    });

    function artField() {
        return new FieldInteractor('artImage', { faceKey: 'front' });
    }

    async function savedName(card) {
        return (await readCardData(card)).front.name;
    }

    async function addAndUndoFirstCard() {
        const card = await createCard();
        const path = card.files.get('data');
        await undo();
        expect(activeProject.cards).toEqual([]);
        expect(selectedProjectCard).toBeNull();
        expect(activeEditorCard).toBeNull();
        expect(selectedCards()).toEqual([]);
        await expectFilesRemoved([path]);
        await redo();
        expect(activeProject.cards).toEqual([card]);
        expect(selectedProjectCard).toBe(card);
        expect(selectedCards()).toEqual([card]);
        await expectFilesExist([card.files.get('data')]);
        return card;
    }

    async function replayEditsAcrossCreation(first) {
        await setCardFields({ name: 'Created and edited' });
        await flushCard();
        const second = await createCard();
        await undo();
        expect(activeProject.cards).toEqual([first]);
        expect(selectedProjectCard).toBe(first);
        await undo();
        await undo();
        expect(activeProject.cards).toEqual([]);
        await redo();
        await redo();
        await redo();
        expect(activeProject.cards).toEqual([first, second]);
        expect(selectedProjectCard).toBe(second);
        expect(first.front.name).toBe('Created and edited');
    }

    async function dropImagesAsOneStep() {
        const before = [...activeProject.cards];
        await dropImages([art, art]);
        const dropped = activeProject.cards.slice(before.length);
        expect(dropped.length).toBe(2);
        await undo();
        expect(activeProject.cards).toEqual(before);
        await redo();
        expect(activeProject.cards).toEqual([...before, ...dropped]);
        for (const card of dropped)
            await expectFileContent(card.files.get('front.artImage'), art);
    }

    async function dropWhileFiltered() {
        const kept = await addNamedCard('Keep');
        await filterCards('Keep');
        await dropImages([art]);
        expect(visibleCards()).toEqual([kept]);
        expect(selectedCards()).toEqual([kept]);
        expect(selectedProjectCard).toBe(kept);
        await undo();
        expect(selectedProjectCard).toBe(kept);
        await filterCards('');
    }

    it('undoes and redoes adding cards', async () => {
        const first = await addAndUndoFirstCard();
        await replayEditsAcrossCreation(first);
        await dropImagesAsOneStep();
        await dropWhileFiltered();
    }, 30000);

    async function deleteInProjectOrder([first, middle, last]) {
        selectCards([first, last]);
        await deleteSelectedCards();
        expect(activeProject.cards).toEqual([middle]);
        await undo();
        expect(activeProject.cards).toEqual([first, middle, last]);
        expect(selectedCards()).toEqual([last]);
        expect(selectedProjectCard).toBe(last);
        await redo();
        expect(activeProject.cards).toEqual([middle]);
        await undo();
    }

    async function deleteEverything(cards) {
        selectCards(cards);
        await deleteSelectedCards();
        expect(activeProject.cards).toEqual([]);
        expect(activeEditorCard).toBeNull();
        await undo();
        expect(activeProject.cards).toEqual(cards);
    }

    async function deleteFromSortedFilteredList([zebra, ant, zebraTwo]) {
        const unsort = sortCardsBy('name');
        await filterCards('Zebra');
        selectCards([zebra, zebraTwo]);
        await deleteSelectedCards();
        expect(activeProject.cards).toEqual([ant]);
        await undo();
        expect(activeProject.cards).toEqual([zebra, ant, zebraTwo]);
        expect(selectedCards()).toEqual([zebraTwo]);
        await filterCards('');
        unsort();
    }

    async function undoEditsOfRestoredCard(card) {
        await selectCard(card);
        await setCardFields({ name: 'After edit' });
        await flushCard();
        selectCards([card]);
        await deleteSelectedCards();
        await undo();
        expect(activeEditorCard.front.name).toBe('After edit');
        await undo();
        expect(activeEditorCard.front.name).toBe('Zebra');
    }

    it('undoes and redoes deleting cards', async () => {
        const cards = [
            await addNamedCard('Zebra'), await addNamedCard('Ant'),
            await addNamedCard('Zebra two')
        ];
        await deleteInProjectOrder(cards);
        await deleteEverything(cards);
        await deleteFromSortedFilteredList(cards);
        await undoEditsOfRestoredCard(cards[0]);
    }, 30000);

    async function undoRenameOnDisk(card) {
        await setCardFields({ name: 'Pending name' });
        await undo();
        await flushCard();
        expect(card.front.name).toBe('History card');
        expect(await savedName(card)).toBe('History card');
        await setCardFields({ name: 'Renamed card' });
        await flushCard();
        await undo();
        expect(card.front.name).toBe('History card');
        expect(await savedName(card)).toBe('History card');
        await redo();
        expect(activeEditorCard.front.name).toBe('Renamed card');
        expect(await savedName(card)).toBe('Renamed card');
    }

    async function undoAfterSwitchingAway(card) {
        const other = await createCard();
        await selectCard(card);
        await setCardFields({ name: 'Edited first' });
        await flushCard();
        const originalEditor = activeEditorCard;
        await selectCard(other);
        await selectCard(card);
        expect(activeEditorCard).not.toBe(originalEditor);
        await undo();
        expect(activeEditorCard.front.name).toBe('Renamed card');
        await redo();
        expect(activeEditorCard.front.name).toBe('Edited first');
    }

    async function undoBackFaceEdit() {
        await toggleFace('back');
        await flushCard();
        const before = activeEditorCard.back.name;
        await setCardFields({ name: 'Back edit' }, { faceKey: 'back' });
        await flushCard();
        await undo();
        expect(activeEditorCard.back.name).toBe(before);
        expect(activeEditorCard.front.name).toBe('Edited first');
        await redo();
        expect(activeEditorCard.back.name).toBe('Back edit');
        await toggleFace('front');
    }

    async function undoOptionalFieldsAndGroups() {
        await setCardFields({ flavorText: 'Remember this text' });
        await flushCard();
        await history.reset();
        new FieldInteractor('flavorText', { faceKey: 'front' }).remove();
        await flushCard();
        await undo();
        expect(activeEditorCard.front.flavorText).toBe('Remember this text');
        await redo();
        expect(activeEditorCard.front.flavorText).toBeNull();

        const group = document.querySelector(
            'cm-face-form[data-face-id="front"] form-group[optional][show]'
        );
        const shown = group.model[group.showKey];
        group.toggleShow(!shown);
        await flushCard();
        await undo();
        expect(group.model[group.showKey]).toBe(shown);
        await redo();
        expect(group.model[group.showKey]).toBe(!shown);
    }

    it('undoes and redoes field edits', async () => {
        const card = await addNamedCard('History card');
        await history.reset();
        await undoRenameOnDisk(card);
        await undoAfterSwitchingAway(card);
        await undoBackFaceEdit();
        await undoOptionalFieldsAndGroups();
    }, 30000);

    async function undoClearingUploadedImage(card) {
        await setCardFields({ artImage: art });
        await flushCard();
        await history.reset();
        artField().clear();
        await flushCard();
        await undo();
        await expectFileContent(card.files.get('front.artImage'), art);
        expect(typeof activeEditorCard.front.artImage.clone).toBe('function');
        await redo();
        expect(activeEditorCard.front.artImage.imageUrl).toBeFalsy();
        await undo();
    }

    async function undoCrops() {
        const field = artField();
        const before = field.value.crop.clone();
        const ValueClass = field.value.constructor;
        field.fieldElement.setCrop(new ImageCrop(100, 120, 3, 4));
        await flushCard();
        await undo();
        expect({ ...field.value.crop }).toEqual({ ...before });
        expect(field.value.constructor).toBe(ValueClass);
        field.value.crop.xOffset = 99;
        await redo();
        expect({ ...field.value.crop }).toEqual({ ...new ImageCrop(100, 120, 3, 4) });
        await undo();
        expect({ ...field.value.crop }).toEqual({ ...before });
    }

    async function reopenAtFirstCard() {
        await flushCard();
        await activeProject.save();
        const [card] = (await reopenProject()).cards;
        await selectCard(card);
        return card;
    }

    async function undoReplacingThenClearing(card) {
        await artField().setValue(otherArt);
        await flushCard();
        artField().clear();
        await flushCard();
        await undo();
        await expectFileContent(card.files.get('front.artImage'), art);
        await redo();
        expect(card.files.get('front.artImage')).toBeUndefined();
        await undo();
    }

    async function undoOverwriteAndRename(card) {
        await setCardFields({ artImage: otherArt });
        await flushCard();
        await setCardFields({ name: 'Moved image' });
        await flushCard();
        await undo();
        await undo();
        await expectFileContent(card.files.get('front.artImage'), art);
        await redo();
        await redo();
        expect(card.front.name).toBe('Moved image');
        await expectFileContent(card.files.get('front.artImage'), otherArt);
    }

    async function undoClearingDiskImageAcrossReopen() {
        await undo();
        await undo();
        await reopenAtFirstCard();
        artField().clear();
        await flushCard();
        await undo();
        const card = await reopenAtFirstCard();
        await expectFileContent(card.files.get('front.artImage'), art);
    }

    it('undoes and redoes image edits', async () => {
        const card = await addNamedCard('Image card');
        await undoClearingUploadedImage(card);
        await undoCrops();
        const loaded = await reopenAtFirstCard();
        await undoReplacingThenClearing(loaded);
        await undoOverwriteAndRename(loaded);
        await undoClearingDiskImageAcrossReopen();
    }, 30000);

    describe('template changes', () => {
        let card;

        beforeEach(async () => {
            card = await addNamedCard('History card');
            await history.reset();
        });

        function templateField() {
            return new FieldInteractor('template', { faceKey: 'front' }).fieldElement;
        }

        async function changeTemplate() {
            const field = templateField();
            const next = field.options.find(option => option.id !== field.value).id;
            await field.onChange({ target: { value: next } });
            return next;
        }

        it('records the field event and rebuilds the face on change, undo and redo',
           async () => {
               const oldFace = activeEditorCard.front;
               const oldTemplate = oldFace.template;
               const fieldChanged = jasmine.createSpy('fieldChanged');
               document.querySelector('cm-card-form').addEventListener(
                   'cm-field-changed', fieldChanged, { once: true }
               );

               const next = await changeTemplate();
               const changedFace = activeEditorCard.front;
               expect(changedFace).not.toBe(oldFace);
               expect(fieldChanged).toHaveBeenCalledOnceWith(jasmine.objectContaining({
                   detail: {
                       faceId: 'front', fieldId: 'template',
                       oldValue: oldTemplate, newValue: next
                   }
               }));
               expect((await readCardData(card)).front.template).toBe(next);

               await undo();
               const restoredFace = activeEditorCard.front;
               expect(restoredFace).not.toBe(changedFace);
               expect(restoredFace.template).toBe(oldTemplate);
               expect((await readCardData(card)).front.template).toBe(oldTemplate);

               await redo();
               expect(activeEditorCard.front).not.toBe(restoredFace);
               expect(activeEditorCard.front.template).toBe(next);
               expect((await readCardData(card)).front.template).toBe(next);
           });

        it('saves pending edits and keeps them in separate undo steps', async () => {
            await setCardFields({ name: 'Pending template edit' });
            const next = await changeTemplate();
            expect(card.front.template).toBe(next);
            expect(await savedName(card)).toBe('Pending template edit');
            await undo();
            expect(activeEditorCard.front.name).toBe('Pending template edit');
            await undo();
            expect(activeEditorCard.front.name).toBe('History card');
        });

        it('keeps redo available after an unchanged selection', async () => {
            const next = await changeTemplate();
            await undo();
            const field = templateField();
            await field.onChange({ target: { value: field.value } });
            await redo();
            expect(activeEditorCard.front.template).toBe(next);
        });

        it('replays changes on the original card after selection moves', async () => {
            const other = await addNamedCard('Other card');
            await selectCard(card);
            await history.reset();
            const before = card.front.template;
            const next = await changeTemplate();
            await selectCard(other);
            const editor = activeEditorCard;
            await undo();
            expect(card.front.template).toBe(before);
            expect(activeEditorCard).toBe(editor);
            await redo();
            expect(card.front.template).toBe(next);
            expect(activeEditorCard).toBe(editor);
        });
    });

    describe('regressions', () => {
        let card;

        async function loadDiskImage() {
            card = await addNamedCard('History card', { artImage: art });
            card = await reopenAtFirstCard();
            return artField();
        }

        it('finishes undo in the old project before replacing it', async () => {
            card = await addNamedCard('History card', { artImage: art });
            const url = activeEditorCard.front.artImage.imageUrl;
            await history.reset();
            await setCardFields({ name: 'Before switching' });
            await flushCard();
            const entered = deferred();
            const finish = deferred();
            const originalProject = activeProject;
            const save = card.save.bind(card);
            spyOn(card, 'save').and.callFake(async () => {
                entered.resolve();
                await finish.promise;
                expect(activeProject).toBe(originalProject);
                await save();
            });
            const undoing = undo();
            await entered.promise;
            const nextProject = createTestProject();
            finish.resolve();
            await Promise.all([undoing, nextProject]);
            expect(activeProject).not.toBe(originalProject);
            await expectAsync(fetch(url)).toBeRejected();
            await undo();
            await redo();
            expect(activeProject.cards.length).toBe(0);
        });

        it('waits for a slow image read before a save deletes its file', async () => {
            const field = await loadDiskImage();
            const url = field.value.imageUrl;
            const path = card.files.get('front.artImage');
            const entered = deferred();
            const finish = deferred();
            const fetchImage = window.fetch.bind(window);
            spyOn(window, 'fetch').and.callFake(async (input, ...args) => {
                if (input !== url) return fetchImage(input, ...args);
                entered.resolve();
                await finish.promise;
                return fetchImage(input, ...args);
            });
            field.clear();
            await entered.promise;
            let complete = false;
            const saving = flushCard().then(() => { complete = true; });
            try {
                await expectFilesExist([path]);
                expect(complete).toBeFalse();
            } finally {
                finish.resolve();
            }
            await saving;
            await expectFilesRemoved([path]);
            await undo();
            await expectFileContent(card.files.get('front.artImage'), art);
        });

        it('keeps an image on disk when it cannot be retained, and allows a retry',
           async () => {
               const field = await loadDiskImage();
               const image = field.value;
               const url = image.imageUrl;
               const path = card.files.get('front.artImage');
               const fetchImage = window.fetch.bind(window);
               const read = spyOn(window, 'fetch').and.callFake((input, ...args) => {
                   if (input === url)
                       return Promise.resolve(new Response(null, { status: 503 }));
                   return fetchImage(input, ...args);
               });
               field.clear();
               await expectAsync(flushCard())
                   .toBeRejectedWithError(`Cannot retain image: ${url}`);
               expect(await platform.checkFileExists(path)).toBeTrue();
               read.and.callThrough();
               await history.push(card, new CustomEvent('cm-field-changed', { detail: {
                   faceId: 'front', fieldId: 'artImage',
                   oldValue: image, newValue: new ImageFieldValue()
               } }));
               const saving = document.querySelector('cm-card-form').save();
               await flushCard();
               await saving;
               await undo();
               await expectFileContent(card.files.get('front.artImage'), art);
           });
    });
});
