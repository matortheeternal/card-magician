import './dialogSystem.js';
import { hotkeys, registerHotkey } from './hotkeySystem.js';

describe('Hotkeys', () => {
    let container, pressed, hotkey;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.append(container);
        pressed = jasmine.createSpy('ArrowDown');
        hotkey = registerHotkey('ArrowDown', pressed);
    });

    afterEach(() => {
        hotkeys.remove(hotkey);
        container.remove();
    });

    function press(target, options = {}) {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowDown', bubbles: true, composed: true, cancelable: true,
            ...options
        });
        target.dispatchEvent(event);
        return event;
    }

    it('handles an unmodified arrow and prevents page scrolling', () => {
        expect(press(document.body).defaultPrevented).toBeTrue();
        expect(pressed).toHaveBeenCalledTimes(1);
    });

    it('leaves modified arrows for other behavior', () => {
        expect(press(document.body, { shiftKey: true }).defaultPrevented).toBeFalse();
        expect(pressed).not.toHaveBeenCalled();
    });

    it('leaves arrows to editors and controls', () => {
        container.innerHTML = `
            <input><textarea></textarea><select><option>A</option></select>
            <div contenteditable="true"><span>Editor</span></div>
            <sl-input></sl-input><sl-textarea></sl-textarea>
            <sl-select></sl-select><sl-range></sl-range>
            <div role="listbox" tabindex="0"></div>`;
        for (const control of container.children) {
            expect(press(control).defaultPrevented).withContext(control.tagName)
                .toBeFalse();
        }
        expect(press(container.querySelector('span')).defaultPrevented).toBeFalse();
        expect(pressed).not.toHaveBeenCalled();
    });

    it('leaves arrows to controls inside a shadow root', () => {
        const shadow = container.attachShadow({ mode: 'open' });
        shadow.innerHTML = '<input>';
        expect(press(shadow.querySelector('input')).defaultPrevented).toBeFalse();
        expect(pressed).not.toHaveBeenCalled();
    });
});
