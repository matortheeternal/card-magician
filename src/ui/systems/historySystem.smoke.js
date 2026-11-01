import * as history from './historySystem.js';
import CardFieldChange from './history/CardFieldChange.js';
import HistoryEntry from './history/HistoryEntry.js';
import { executeAction } from './actionSystem.js';
import {
    createCard, createTestProject, deleteTestProject, flushCard,
    setCardFields, toggleFace, expectFilesToMatch
} from '../../shared/testing/testUtils.js';
import FieldInteractor from '../../shared/testing/FieldInteractor.js';
import YAMLSerializer from '../../domain/projects/serializers/YAMLSerializer.js';
import ImageCrop from '../../domain/card/ImageCrop.js';
import ImageFieldValue from '../../domain/card/ImageFieldValue.js';
import { retainImage } from '../../domain/card/imageRetention.js';
import { checkFileExists } from '../../shared/fsUtils.js';
import { readBinaryFile, writeBinaryFile } from '../../shared/platformAdapter.js';

function deferred() {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    return { promise, resolve };
}

function record(card, fieldId, oldValue, newValue, extra = {}) {
    return history.push(card, new CustomEvent('cm-field-changed', {
        detail: { faceId: 'front', fieldId, oldValue, newValue, ...extra }
    }));
}

// Real form/persistence coverage plus controlled saves for deterministic races.
describe('History', () => {
    beforeEach(async () => {
        await history.reset();
    });

    afterEach(async () => {
        await history.reset();
    });

    describe('queue and entries', () => {
        let card;

        beforeEach(() => {
            window.selectedProjectCard ??= null;
            // This object is intentionally unselected: replay must target its
            // captured card rather than the application's current selection.
            card = { front: {}, back: {}, save: jasmine.createSpy('save')
                .and.resolveTo() };
        });

        async function edit(field, before, after, extra) {
            const face = card[extra?.faceId || 'front'];
            const model = extra?.modelKey ? face[extra.modelKey] : face;
            model[field] = after;
            return record(card, field, before, after, extra);
        }

        it('matches only complete field-change events', () => {
            const detail = {
                faceId: 'front', fieldId: 'name', oldValue: undefined, newValue: ''
            };
            const event = new CustomEvent('cm-field-changed', { detail });
            expect(CardFieldChange.supports(event)).toBeTrue();
            expect(new CardFieldChange(card, event)).toBeInstanceOf(HistoryEntry);
            expect(CardFieldChange.supports(null)).toBeFalse();
            expect(CardFieldChange.supports({ detail })).toBeFalse();
            expect(CardFieldChange.supports(
                new CustomEvent('cm-template-changed', { detail })
            )).toBeFalse();
            for (const key of Object.keys(detail)) {
                const incomplete = { ...detail };
                delete incomplete[key];
                expect(CardFieldChange.supports(new CustomEvent('cm-field-changed', {
                    detail: incomplete
                }))).withContext(`Missing ${key}`).toBeFalse();
            }
        });

        it('does not combine entries of different classes', () => {
            const event = new CustomEvent('cm-field-changed', { detail: {
                faceId: 'front', fieldId: 'name', oldValue: '', newValue: 'A'
            } });
            const entry = new CardFieldChange(card, event);
            class DifferentChange extends CardFieldChange {}
            expect(entry.combine(new DifferentChange(card, event))).toBeUndefined();
        });

        it('does nothing when both stacks are empty', async () => {
            await history.undo();
            await history.redo();
            expect(card.save).not.toHaveBeenCalled();
        });

        for (const value of ['', false, 0, null, undefined]) {
            it(`round trips ${String(value)} without losing the value`, async () => {
                await edit('value', 'original', value);
                await history.undo();
                expect(card.front.value).toBe('original');
                await history.redo();
                expect(card.front.value).toBe(value);
            });
        }

        it('undoes in reverse order and redoes in original order', async () => {
            await edit('name', '', 'Name');
            await edit('rulesText', '', 'Rules');
            await history.undo();
            expect(card.front).toEqual({ name: 'Name', rulesText: '' });
            await history.undo();
            expect(card.front.name).toBe('');
            await history.redo();
            await history.redo();
            expect(card.front).toEqual({ name: 'Name', rulesText: 'Rules' });
        });

        it('merges typing while preserving the first old value', async () => {
            await edit('name', '', 'A');
            await edit('name', 'A', 'AB');
            await history.undo();
            expect(card.front.name).toBe('');
            await history.undo();
            expect(card.save).toHaveBeenCalledTimes(1);
            await history.redo();
            expect(card.front.name).toBe('AB');
        });

        it('starts another group after inactivity', async () => {
            const now = spyOn(Date, 'now').and.returnValue(1000);
            await edit('name', '', 'A');
            now.and.returnValue(12000);
            await edit('name', 'A', 'AB');
            await history.undo();
            expect(card.front.name).toBe('A');
        });

        it('refreshes the merge interval after each keystroke', async () => {
            const now = spyOn(Date, 'now').and.returnValue(1000);
            await edit('name', '', 'A');
            now.and.returnValue(10000);
            await edit('name', 'A', 'AB');
            now.and.returnValue(19000);
            await edit('name', 'AB', 'ABC');
            await history.undo();
            expect(card.front.name).toBe('');
        });

        it('invalidates redo on a new edit, including a merged edit', async () => {
            await edit('name', '', 'A');
            await edit('rulesText', '', 'Rules');
            await history.undo();
            await edit('name', 'A', 'AB');
            await history.redo();
            expect(card.front.rulesText).toBe('');
            // Combining across Undo is an intentional grouping policy.
            await history.undo();
            expect(card.front.name).toBe('');
        });

        it('keeps faces and submodels distinct when merging', async () => {
            card.front.extra = { name: '' };
            await edit('name', '', 'Front');
            await edit('name', '', 'Back', { faceId: 'back' });
            await edit('name', '', 'Subcard', { modelKey: 'extra' });
            await history.undo();
            expect(card.front.extra.name).toBe('');
            expect(card.front.name).toBe('Front');
            expect(card.back.name).toBe('Back');
            await history.undo();
            expect(card.back.name).toBe('');
        });

        it('keeps different cards distinct', async () => {
            const other = { front: { name: 'Other' }, save: async () => {} };
            await edit('name', '', 'First');
            await record(other, 'name', '', 'Other');
            await history.undo();
            expect(other.front.name).toBe('');
            expect(card.front.name).toBe('First');
        });

        it('rejects incomplete event addresses without losing redo', async () => {
            await edit('name', '', 'A');
            await history.undo();
            await history.push(card, { detail: {} });
            await history.push(card, { detail: { fieldId: 'name' } });
            await history.redo();
            expect(card.front.name).toBe('A');
            expect(card.front.undefined).toBeUndefined();
        });

        it('copies mutable values on recording and on each replay', async () => {
            const before = { nested: ['old'] };
            const after = { nested: ['new'] };
            await edit('settings', before, after);
            before.nested.push('mutation');
            after.nested.push('mutation');
            await history.undo();
            expect(card.front.settings).toEqual({ nested: ['old'] });
            card.front.settings.nested.push('live mutation');
            await history.redo();
            expect(card.front.settings).toEqual({ nested: ['new'] });
            await history.undo();
            expect(card.front.settings).toEqual({ nested: ['old'] });
        });

        it('serializes rapid undo and redo calls', async () => {
            await edit('name', '', 'A');
            await edit('rulesText', '', 'B');
            const entered = deferred();
            const finish = deferred();
            card.save.and.callFake(async () => {
                entered.resolve();
                await finish.promise;
            });
            const first = history.undo();
            await entered.promise;
            const second = history.undo();
            expect(card.save).toHaveBeenCalledTimes(1);
            finish.resolve();
            await Promise.all([first, second]);
            expect(card.front).toEqual({ name: '', rulesText: '' });
            await Promise.all([history.redo(), history.redo()]);
            expect(card.front).toEqual({ name: 'A', rulesText: 'B' });
        });

        it('captures values immediately when an edit waits behind a save', async () => {
            await edit('name', '', 'A');
            const entered = deferred();
            const finish = deferred();
            card.save.and.callFake(async () => {
                entered.resolve();
                await finish.promise;
            });
            const undo = history.undo();
            await entered.promise;
            const before = ['old'];
            const after = ['new'];
            const pushed = edit('settings', before, after);
            before.push('mutation');
            after.push('mutation');
            finish.resolve();
            await Promise.all([undo, pushed]);
            card.save.and.resolveTo();
            await history.undo();
            expect(card.front.settings).toEqual(['old']);
            await history.redo();
            expect(card.front.settings).toEqual(['new']);
            await history.redo();
            expect(card.front.name).toBe('');
        });

        it('awaits saves before completing undo', async () => {
            await edit('name', '', 'A');
            const entered = deferred();
            const finish = deferred();
            card.save.and.callFake(async () => {
                entered.resolve();
                await finish.promise;
            });
            let completed = false;
            const undo = history.undo().then(() => { completed = true; });
            await entered.promise;
            expect(completed).toBeFalse();
            finish.resolve();
            await undo;
            expect(completed).toBeTrue();
        });

        it('allows retrying undo after a save failure', async () => {
            await edit('name', '', 'A');
            card.save.and.rejectWith(new Error('Expected history smoke failure'));
            await history.undo();
            card.save.and.resolveTo();
            await history.undo();
            await history.redo();
            expect(card.front.name).toBe('A');
            expect(card.save).toHaveBeenCalledTimes(3);
        });

        it('retains the redo entry after a save failure', async () => {
            await edit('name', '', 'A');
            await history.undo();
            card.save.and.rejectWith(new Error('Expected redo smoke failure'));
            await history.redo();
            card.save.and.resolveTo();
            await history.redo();
            await history.undo();
            expect(card.front.name).toBe('');
            expect(card.save).toHaveBeenCalledTimes(4);
        });

        it('recovers the queue after a target resolution exception', async () => {
            await edit('name', '', 'A');
            delete card.front;
            await expectAsync(history.undo()).toBeRejected();
            card.front = { name: 'A' };
            await history.undo();
            expect(card.front.name).toBe('');
        });

        it('queues reset and clears both stacks', async () => {
            await edit('name', '', 'A');
            const entered = deferred();
            const finish = deferred();
            card.save.and.callFake(async () => {
                entered.resolve();
                await finish.promise;
            });
            const undo = history.undo();
            await entered.promise;
            const reset = history.reset();
            finish.resolve();
            await Promise.all([undo, reset]);
            card.save.calls.reset();
            await history.undo();
            await history.redo();
            expect(card.save).not.toHaveBeenCalled();
        });
    });

    describe('card creation and deletion', () => {
        let project, list, art;

        function select(cards) {
            list.selection = list.activeRows.flatMap((row, index) => {
                return cards.includes(row.original) ? [index] : [];
            });
        }

        async function namedCard(name) {
            const card = await createCard();
            await setCardFields({ name });
            await flushCard();
            return card;
        }

        beforeAll(async () => {
            art = new File([await (await fetch('/tests/fixtures/art.jpg')).blob()],
                           'art.jpg', { type: 'image/jpeg' });
        });

        beforeEach(async () => {
            project = await createTestProject();
            list = document.querySelector('cm-set-view cm-list-view');
        });

        afterEach(async () => {
            await flushCard();
            await history.reset();
            await deleteTestProject();
        });

        it('undoes and redoes creating the first card with stable identity', async () => {
            const card = await createCard();
            const path = card.files.get('data');
            await history.undo();
            expect(project.cards).toEqual([]);
            expect(selectedProjectCard).toBeNull();
            expect(activeEditorCard).toBeNull();
            expect(list.selection).toEqual([]);
            expect(await checkFileExists(path)).toBeFalse();
            await history.redo();
            expect(project.cards).toEqual([card]);
            expect(selectedProjectCard).toBe(card);
            expect(list.selection.map(row => row.original)).toEqual([card]);
            expect(await checkFileExists(card.files.get('data'))).toBeTrue();
        });

        it('preserves separate creation steps and restores prior selection', async () => {
            const first = await createCard();
            const second = await createCard();
            await history.undo();
            expect(project.cards).toEqual([first]);
            expect(selectedProjectCard).toBe(first);
            await history.undo();
            expect(project.cards).toEqual([]);
            await history.redo();
            await history.redo();
            expect(project.cards).toEqual([first, second]);
            expect(selectedProjectCard).toBe(second);
        });

        it('replays field changes across create undo/redo', async () => {
            const card = await createCard();
            await setCardFields({ name: 'Created and edited' });
            await flushCard();
            await history.undo();
            await history.undo();
            expect(project.cards).toEqual([]);
            await history.redo();
            await history.redo();
            expect(project.cards[0]).toBe(card);
            expect(activeEditorCard.front.name).toBe('Created and edited');
        });

        it('undoes a multi-selection delete as one step in project order', async () => {
            const first = await namedCard('First');
            const middle = await namedCard('Middle');
            const last = await namedCard('Last');
            await history.reset();
            select([first, last]);
            await executeAction('delete-selected-cards');
            expect(project.cards).toEqual([middle]);
            await history.undo();
            expect(project.cards).toEqual([first, middle, last]);
            expect(list.selection.map(row => row.original)).toEqual([last]);
            expect(selectedProjectCard).toBe(last);
            await history.redo();
            expect(project.cards).toEqual([middle]);
        });

        it('deletes every selected card and restores an empty set', async () => {
            const first = await namedCard('First');
            const second = await namedCard('Second');
            await history.reset();
            select([first, second]);
            await executeAction('delete-selected-cards');
            expect(project.cards).toEqual([]);
            expect(activeEditorCard).toBeNull();
            await history.undo();
            expect(project.cards).toEqual([first, second]);
        });

        it('uses card identity with sorted and filtered rows', async () => {
            const first = await namedCard('Zebra');
            const second = await namedCard('Ant');
            const third = await namedCard('Zebra two');
            await history.reset();
            const column = list.activeColumns.find(col => col.id === 'name');
            column.sort = { priority: 1, direction: 'asc' };
            list.sortRows();
            await executeAction('filter', 'Zebra');
            select([first, third]);
            await executeAction('delete-selected-cards');
            expect(project.cards).toEqual([second]);
            await history.undo();
            expect(project.cards).toEqual([first, second, third]);
            expect(new Set(list.selection.map(row => row.original)))
                .toEqual(new Set([third]));
            await executeAction('filter', '');
            delete column.sort;
        });

        it('flushes pending text and notes before deleting, without recreating files',
           async () => {
               const card = await namedCard('Pending');
               await history.reset();
               await setCardFields({ rulesText: 'Keep pending text' });
               const properties = document.querySelector('cm-card-properties');
               properties.card.notes = 'Keep pending notes';
               properties.save();
               const path = card.files.get('data');
               await executeAction('delete-selected-cards');
               await flushCard();
               expect(await checkFileExists(path)).toBeFalse();
               await history.undo();
               expect(activeEditorCard.front.rulesText).toBe('Keep pending text');
               expect(card.notes).toBe('Keep pending notes');
           });

        it('restores disk-loaded front/back image bytes after delete and repeated replay',
           async () => {
               await namedCard('Loaded images');
               await setCardFields({ artImage: art });
               await toggleFace('back');
               await setCardFields({ artImage: art }, { faceKey: 'back' });
               await flushCard();
               await project.save();
               await executeAction('open-project', project.filePath);
               project = activeProject;
               const card = project.cards[0];
               await executeAction('select-card', card);
               select([card]);
               const paths = [...card.files.entries].map(([, path]) => path);
               await executeAction('delete-selected-cards');
               for (const path of paths)
                   expect(await checkFileExists(path)).toBeFalse();
               for (let replay = 0; replay < 2; replay++) {
                   await history.undo();
                   for (const key of ['front.artImage', 'back.artImage']) {
                       const bytes = await readBinaryFile(card.files.get(key));
                       await expectFilesToMatch(new File([bytes], ''), art);
                   }
                   await history.redo();
               }
           });

        it('restores additional tracked files after deletion', async () => {
            const card = await namedCard('Attachment');
            card.files.definitions.push(new window.CardFileDefinition('attachment', {
                suffix: ' - Attachment', extension: '.bin'
            }));
            const path = await card.files.getCanonicalPath('attachment');
            const bytes = new Uint8Array([0, 1, 127, 255]);
            await writeBinaryFile(path, bytes);
            await card.files.set('attachment', path);
            await history.reset();
            await executeAction('delete-selected-cards');
            expect(await checkFileExists(path)).toBeFalse();
            await history.undo();
            const restored = await readBinaryFile(card.files.get('attachment'));
            expect(new Uint8Array(restored)).toEqual(bytes);
        });

        it('ignores an empty deletion without clearing redo', async () => {
            const card = await createCard();
            await history.undo();
            select([]);
            await executeAction('delete-selected-cards');
            await history.redo();
            expect(project.cards).toEqual([card]);
        });

        it('keeps earlier field history usable after delete/restore', async () => {
            const card = await namedCard('Before edit');
            await history.reset();
            await setCardFields({ name: 'After edit' });
            await flushCard();
            await executeAction('delete-selected-cards');
            await history.undo();
            expect(project.cards[0]).toBe(card);
            expect(activeEditorCard.front.name).toBe('After edit');
            await history.undo();
            expect(activeEditorCard.front.name).toBe('Before edit');
            await history.redo();
            await history.redo();
            expect(project.cards).toEqual([]);
        });

        it('serializes concurrent creations in order', async () => {
            const view = document.querySelector('cm-set-view');
            const first = new activeGame.Card();
            const second = new activeGame.Card();
            await Promise.all([view.createCards([first]), view.createCards([second])]);
            expect(project.cards).toEqual([first, second]);
            await history.undo();
            expect(project.cards).toEqual([first]);
            expect(selectedProjectCard).toBe(first);
            await history.undo();
            expect(project.cards).toEqual([]);
        });

        it('restores files from earlier cards if a batch deletion fails', async () => {
            const first = await namedCard('First');
            const second = await namedCard('Second');
            const paths = [first.files.get('data'), second.files.get('data')];
            await history.reset();
            select([first, second]);
            const deletion = spyOn(second, 'deleteFiles')
                .and.rejectWith(new Error('Expected delete failure'));
            Object.defineProperty(second, 'deleteFiles', { enumerable: false });
            await expectAsync(executeAction('delete-selected-cards')).toBeRejected();
            expect(project.cards).toEqual([first, second]);
            for (const path of paths)
                expect(await checkFileExists(path)).toBeTrue();
            await history.undo();
            expect(project.cards).toEqual([first, second]);
            deletion.and.callThrough();
            await executeAction('delete-selected-cards');
            await history.undo();
            expect(project.cards).toEqual([first, second]);
        });

        it('does not record a creation whose save fails and allows retry', async () => {
            const view = document.querySelector('cm-set-view');
            const card = new activeGame.Card();
            const save = spyOn(card, 'save')
                .and.rejectWith(new Error('Expected create failure'));
            Object.defineProperty(card, 'save', { enumerable: false });
            await expectAsync(view.createCards([card])).toBeRejected();
            expect(project.cards).toEqual([]);
            await history.undo();
            expect(project.cards).toEqual([]);
            save.and.callThrough();
            await view.createCards([card]);
            expect(project.cards).toEqual([card]);
            await history.undo();
            expect(project.cards).toEqual([]);
        });

        it('keeps selection when a new card is excluded by the filter', async () => {
            const kept = await namedCard('Keep');
            await executeAction('filter', 'Keep');
            const hidden = new activeGame.Card({ front: { name: 'Hidden' } });
            await document.querySelector('cm-set-view').createCards([hidden]);
            expect(list.rows).toEqual([kept]);
            expect(list.selection.map(row => row.original)).toEqual([kept]);
            expect(selectedProjectCard).toBe(kept);
            await history.undo();
            expect(project.cards).toEqual([kept]);
            expect(selectedProjectCard).toBe(kept);
            await executeAction('filter', '');
        });

        it('drops several images as one creation entry', async () => {
            const view = document.querySelector('cm-set-view');
            await view.onDrop({
                preventDefault() {}, stopPropagation() {},
                dataTransfer: { items: [art, art].map(file => ({
                    kind: 'file', type: file.type, getAsFile: () => file
                })) }
            });
            const cards = [...project.cards];
            expect(cards.length).toBe(2);
            await history.undo();
            expect(project.cards).toEqual([]);
            await history.redo();
            expect(project.cards).toEqual(cards);
            for (const card of cards) {
                const bytes = await readBinaryFile(card.files.get('front.artImage'));
                await expectFilesToMatch(new File([bytes], ''), art);
            }
        });

        it('duplicates a selection as one creation entry', async () => {
            const first = await namedCard('First');
            const second = await namedCard('Second');
            await history.reset();
            select([first, second]);
            await executeAction('duplicate-selected-cards');
            const copies = project.cards.slice(2);
            expect(copies.length).toBe(2);
            await history.undo();
            expect(project.cards).toEqual([first, second]);
            await history.redo();
            expect(project.cards).toEqual([first, second, ...copies]);
        });

        it('pastes several cards as one creation entry', async () => {
            let clipboard;
            spyOn(navigator.clipboard, 'write').and.callFake(async items => {
                clipboard = await Promise.all(items.map(async item => {
                    const blobs = new Map(await Promise.all(item.types.map(async type => {
                        return [type, await item.getType(type)];
                    })));
                    return { types: item.types, getType: async type => blobs.get(type) };
                }));
            });
            spyOn(navigator.clipboard, 'read').and.callFake(async () => clipboard);
            const first = await namedCard('First');
            const second = await namedCard('Second');
            select([first, second]);
            await executeAction('copy');
            await history.reset();
            await executeAction('paste');
            const copies = project.cards.slice(2);
            expect(copies.length).toBe(2);
            await history.undo();
            expect(project.cards).toEqual([first, second]);
            await history.redo();
            expect(project.cards).toEqual([first, second, ...copies]);
        });
    });

    describe('forms and persistence', () => {
        let card, art;

        beforeAll(async () => {
            const response = await fetch('/tests/fixtures/art.jpg');
            art = new File([await response.blob()], 'art.jpg', { type: 'image/jpeg' });
        });

        beforeEach(async () => {
            await createTestProject();
            card = await createCard();
            await setCardFields({ name: 'History card' });
            await flushCard();
            await history.reset();
        });

        afterEach(async () => {
            await flushCard();
            await history.reset();
            await deleteTestProject();
        });

        it('retains a disk image independently of its source file', async () => {
            await setCardFields({ artImage: art });
            await flushCard();
            await activeProject.save();
            await executeAction('open-project', activeProject.filePath);
            card = activeProject.cards[0];
            await executeAction('select-card', card);
            const image = activeEditorCard.front.artImage;
            const crop = image.crop.clone();
            expect(image.imageUrl.startsWith('blob:')).toBeFalse();
            const retained = await retainImage(image);
            expect(retained).not.toBe(image);
            expect(retained.crop).not.toBe(image.crop);
            expect(retained.crop).toEqual(crop);
            expect(retained.dirty).toBeTrue();
            const path = card.files.get('front.artImage');
            new FieldInteractor('artImage', { faceKey: 'front' }).clear();
            await flushCard();
            expect(await checkFileExists(path)).toBeFalse();
            await expectFilesToMatch(new File([await retained.loadImageData()], ''), art);
        });

        it('shares blob content with independent editable state', async () => {
            const image = await ImageFieldValue.fromFile(art);
            const retained = await retainImage(image);
            expect(retained.imageUrl).toBe(image.imageUrl);
            retained.crop.xOffset = 13;
            expect(image.crop.xOffset).toBe(0);
            await expectFilesToMatch(new File([await retained.loadImageData()], ''), art);
        });

        it('retains backup bytes after the image URL expires', async () => {
            const image = new ImageFieldValue('/missing-history-image.jpg');
            const retained = await retainImage(image, art);
            expect(image.imageUrl).toBe('/missing-history-image.jpg');
            await expectFilesToMatch(new File([await retained.loadImageData()], ''), art);
        });

        it('copies empty and data URL image values without fetching', async () => {
            const fetchImage = spyOn(window, 'fetch').and.callThrough();
            const empty = new ImageFieldValue();
            expect((await retainImage(empty)).imageUrl).toBeNull();
            const url = 'data:image/png;base64,aGVsbG8=';
            const image = new ImageFieldValue(url);
            expect((await retainImage(image)).imageUrl).toBe(url);
            expect(fetchImage).not.toHaveBeenCalled();
        });

        it('reports retention failures without changing the source value', async () => {
            const image = new ImageFieldValue('/missing-history-image.jpg');
            spyOn(window, 'fetch').and.resolveTo(new Response(null, { status: 404 }));
            await expectAsync(retainImage(image)).toBeRejectedWithError(
                'Cannot retain image: /missing-history-image.jpg'
            );
            expect(image.imageUrl).toBe('/missing-history-image.jpg');
        });

        it('records bubbling field changes and persists undo and redo', async () => {
            await setCardFields({ name: 'Renamed card' });
            await flushCard();
            await history.undo();
            expect(activeEditorCard.front.name).toBe('History card');
            expect(card.front.name).toBe('History card');
            expect((await YAMLSerializer.load(card.files.get('data'))).front.name)
                .toBe('History card');
            await history.redo();
            expect(activeEditorCard.front.name).toBe('Renamed card');
            expect((await YAMLSerializer.load(card.files.get('data'))).front.name)
                .toBe('Renamed card');
        });

        it('undoes typing before the debounced form save fires', async () => {
            await setCardFields({ name: 'Pending name' });
            await history.undo();
            await flushCard();
            expect(card.front.name).toBe('History card');
            expect((await YAMLSerializer.load(card.files.get('data'))).front.name)
                .toBe('History card');
        });

        it('resolves the current editor after switching away and back', async () => {
            const other = await createCard();
            await executeAction('select-card', card);
            await history.reset();
            await setCardFields({ name: 'Edited first' });
            await flushCard();
            const originalEditor = activeEditorCard;
            await executeAction('select-card', other);
            await executeAction('select-card', card);
            expect(activeEditorCard).not.toBe(originalEditor);
            await history.undo();
            expect(activeEditorCard.front.name).toBe('History card');
            await history.redo();
            expect(activeEditorCard.front.name).toBe('Edited first');
        });

        it('records the back face address from the bubbling event', async () => {
            await toggleFace('back');
            await flushCard();
            const before = activeEditorCard.back.name;
            await history.reset();
            await setCardFields({ name: 'Back edit' }, { faceKey: 'back' });
            await flushCard();
            await history.undo();
            expect(activeEditorCard.back.name).toBe(before);
            expect(activeEditorCard.front.name).toBe('History card');
            await history.redo();
            expect(activeEditorCard.back.name).toBe('Back edit');
        });

        it('records checkbox-list changes through the options form', async () => {
            // The default face declares this option but does not display it.
            const wrapper = document.createElement('form-field');
            wrapper.setAttribute('field-id', 'otherFrameOptions');
            document.querySelector('cm-options-form[data-face-id="front"]')
                .appendChild(wrapper);
            const field = wrapper.fieldElement;
            const before = structuredClone(field.value);
            const option = field.field.options[0].id;
            await field.onChange({ target: {
                dataset: { id: option }, checked: !before[option]
            } });
            await flushCard();
            await history.undo();
            expect(field.value).toEqual(before);
            await history.redo();
            expect(field.value[option]).toBe(!before[option]);
            wrapper.remove();
        });

        it('records optional field removal and restoration', async () => {
            const field = new FieldInteractor('flavorText', { faceKey: 'front' });
            await setCardFields({ flavorText: 'Remember this text' });
            await flushCard();
            await history.reset();
            field.remove();
            await flushCard();
            await history.undo();
            expect(activeEditorCard.front.flavorText).toBe('Remember this text');
            await history.redo();
            expect(activeEditorCard.front.flavorText).toBeNull();
        });

        it('records optional group toggles', async () => {
            const group = document.querySelector(
                'cm-face-form[data-face-id="front"] form-group[optional][show]'
            );
            expect(group).not.toBeNull();
            const before = group.model[group.showKey];
            group.toggleShow(!before);
            await flushCard();
            await history.undo();
            expect(group.model[group.showKey]).toBe(before);
            await history.redo();
            expect(group.model[group.showKey]).toBe(!before);
        });

        it('updates both models using separate mutable copies', async () => {
            const before = { nested: ['old'] };
            const after = { nested: ['new'] };
            await record(card, 'historySettings', before, after);
            await history.undo();
            expect(activeEditorCard.front.historySettings).toEqual(before);
            expect(card.front.historySettings).toEqual(before);
            expect(activeEditorCard.front.historySettings)
                .not.toBe(card.front.historySettings);
            activeEditorCard.front.historySettings.nested.push('editor mutation');
            expect(card.front.historySettings).toEqual(before);
            await history.redo();
            expect(activeEditorCard.front.historySettings).toEqual(after);
        });

        it('drains history before replacing a project and revokes old blob URLs',
           async () => {
               await setCardFields({ artImage: art });
               await flushCard();
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
               const undo = history.undo();
               await entered.promise;
               const nextProject = createTestProject();
               finish.resolve();
               await Promise.all([undo, nextProject]);
               expect(activeProject).not.toBe(originalProject);
               await expectAsync(fetch(url)).toBeRejected();
               await history.undo();
               await history.redo();
               expect(activeProject.cards.length).toBe(0);
           });

        it('restores uploaded image bytes after clearing and saving', async () => {
            await setCardFields({ artImage: art });
            await flushCard();
            await history.reset();
            new FieldInteractor('artImage', { faceKey: 'front' }).clear();
            await flushCard();
            // Regression: the field setter used to revoke its old URL at 500ms.
            await new Promise(resolve => { setTimeout(resolve, 550); });
            await history.undo();
            const imagePath = card.files.get('front.artImage');
            expect(imagePath).toBeDefined();
            if (imagePath) {
                await expectFilesToMatch(
                    new File([await readBinaryFile(imagePath)], ''), art
                );
            }
            expect(typeof activeEditorCard.front.artImage.clone).toBe('function');
            await history.redo();
            expect(activeEditorCard.front.artImage.imageUrl).toBeFalsy();
        });

        it('restores independent image crops and methods', async () => {
            await setCardFields({ artImage: art });
            await flushCard();
            await history.reset();
            const field = new FieldInteractor('artImage', { faceKey: 'front' });
            const before = field.value.crop.clone();
            const ValueClass = field.value.constructor;
            field.fieldElement.setCrop(new ImageCrop(100, 120, 3, 4));
            await flushCard();
            await history.undo();
            expect({ ...field.value.crop }).toEqual({ ...before });
            expect(field.value.constructor).toBe(ValueClass);
            expect(typeof field.value.clone).toBe('function');
            // An edit after replay must not mutate the stored undo snapshot.
            field.value.crop.xOffset = 99;
            await history.redo();
            expect({ ...field.value.crop }).toEqual({ ...new ImageCrop(100, 120, 3, 4) });
            await history.undo();
            expect({ ...field.value.crop }).toEqual({ ...before });
        });

        // Explicitly deferred features: enable these with their implementations.
        it('restores an image loaded from disk after clear/save/reopen', async () => {
            pending('Deferred: immutable content retention for disk-backed images');
            await setCardFields({ artImage: art });
            await flushCard();
            await activeProject.save();
            const projectPath = activeProject.filePath;
            await executeAction('open-project', projectPath);
            card = activeProject.cards[0];
            await executeAction('select-card', card);
            new FieldInteractor('artImage', { faceKey: 'front' }).clear();
            await flushCard();
            await history.undo();
            await executeAction('open-project', projectPath);
            card = activeProject.cards[0];
            const bytes = await readBinaryFile(card.files.get('front.artImage'));
            await expectFilesToMatch(new File([bytes], ''), art);
        });
        it('preserves historical image content across overwrite and rename', async () => {
            pending('Deferred: immutable content retention for disk-backed images');
            await setCardFields({ artImage: art });
            await flushCard();
            await activeProject.save();
            await executeAction('open-project', activeProject.filePath);
            card = activeProject.cards[0];
            await executeAction('select-card', card);
            const response = await fetch('/tests/fixtures/art2.jpg');
            const replacement = new File([await response.blob()], 'replacement.jpg',
                                         { type: 'image/jpeg' });
            await setCardFields({ artImage: replacement });
            await flushCard();
            await setCardFields({ name: 'Moved image' });
            await flushCard();
            await history.undo();
            await history.undo();
            const bytes = await readBinaryFile(card.files.get('front.artImage'));
            await expectFilesToMatch(new File([bytes], ''), art);
        });
        it('rebuilds the face when replaying a template change', async () => {
            pending('Deferred: template replay');
            const oldTemplate = activeEditorCard.front.template;
            const template = new FieldInteractor('template', { faceKey: 'front' });
            const nextTemplate = template.fieldElement.field.options
                .find(option => option.id !== oldTemplate).id;
            await executeAction('change-template', 'front', nextTemplate);
            await flushCard();
            await record(card, 'template', oldTemplate, nextTemplate);
            const changedFace = activeEditorCard.front;
            await history.undo();
            expect(activeEditorCard.front).not.toBe(changedFace);
            expect(activeEditorCard.front.template).toBe(oldTemplate);
            await history.redo();
            expect(activeEditorCard.front.template).toBe(nextTemplate);
        });
    });
});
