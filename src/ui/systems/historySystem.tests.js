import * as history from './historySystem.js';
import CardFieldChange from './history/CardFieldChange.js';
import HistoryEntry from './history/HistoryEntry.js';

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

describe('History queue', () => {
    beforeEach(async () => {
        spyOn(window.actions, 'get').and.callThrough()
            .withArgs('set-status').and.returnValue(() => {});
        await history.reset();
    });

    afterEach(async () => {
        await history.reset();
    });

    let card;

    beforeEach(() => {
        window.selectedProjectCard ??= null;
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
