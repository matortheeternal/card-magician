import {
    createCard, createTestProject, deleteTestProject
} from '../../../shared/testing/testUtils.js';

describe('Card List', () => {
    let container;
    let moveSelection;

    beforeEach(() => {
        document.activeElement?.blur();
        window.getSelection().removeAllRanges();
        container = document.createElement('div');
        document.body.appendChild(container);
        const list = document.querySelector('cm-card-list cm-list-view');
        moveSelection = spyOn(list, 'moveSelection');
    });

    afterEach(() => container.remove());

    function press(target, key, options = {}) {
        const event = new KeyboardEvent('keydown', {
            key, bubbles: true, composed: true, cancelable: true, ...options
        });
        target.dispatchEvent(event);
        return event;
    }

    it('routes unmodified arrows to card selection and prevents page scrolling', () => {
        expect(press(document.body, 'ArrowUp').defaultPrevented).toBeTrue();
        expect(moveSelection).toHaveBeenCalledWith(-1);
        expect(press(document.body, 'ArrowDown').defaultPrevented).toBeTrue();
        expect(moveSelection).toHaveBeenCalledWith(1);
    });

    it('leaves modified arrows available for other behavior', () => {
        expect(press(document.body, 'ArrowDown', { shiftKey: true }).defaultPrevented)
            .toBeFalse();
        expect(moveSelection).not.toHaveBeenCalled();
    });

    it('preserves arrows in editors and native or Shoelace controls', async () => {
        container.innerHTML = `
            <input><textarea></textarea><select><option>A</option></select>
            <div contenteditable="true"><span>Editor</span></div>
            <sl-input></sl-input><sl-textarea></sl-textarea>
            <sl-select></sl-select><sl-range></sl-range>
            <div role="listbox" tabindex="0"></div>`;
        const controls = Array.from(container.children);
        await Promise.all(controls.map(control => control.updateComplete));
        for (const control of container.children) {
            control.focus();
            expect(press(control, 'ArrowUp').defaultPrevented).toBeFalse();
            expect(press(control, 'ArrowDown').defaultPrevented).toBeFalse();
        }
        expect(moveSelection).not.toHaveBeenCalled();
    });

    it('recognizes controls inside a shadow root', () => {
        const host = document.createElement('div');
        container.appendChild(host);
        const shadow = host.attachShadow({ mode: 'open' });
        shadow.innerHTML = '<input>';
        const input = shadow.querySelector('input');
        input.focus();
        expect(press(input, 'ArrowDown').defaultPrevented).toBeFalse();
        expect(moveSelection).not.toHaveBeenCalled();
    });

    it('skips superseded selections while pending edits are being saved', async () => {
        await createTestProject();
        const first = await createCard();
        const last = await createCard();
        const intermediate = await createCard();
        const cardList = document.querySelector('cm-card-list');
        await cardList.flushSelection();
        let releaseSave;
        let saveStarted;
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
            await deleteTestProject();
        }
    });
});
