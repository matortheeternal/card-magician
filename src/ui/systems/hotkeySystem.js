const modifiers = ['ctrl', 'shift', 'alt'];
const navigationHotkeys = ['arrowup', 'arrowdown'];
const editingHotkeys = [
    'ctrl+c', 'ctrl+v', 'ctrl+x', 'ctrl+a', 'delete', ...navigationHotkeys
];
const navigationControlSelector = [
    'input', 'textarea', 'select', 'button',
    'sl-input', 'sl-textarea', 'sl-select', 'sl-range', 'sl-radio-group',
    'sl-button', 'sl-menu', 'sl-tab-group', 'sl-tree',
    '[role="combobox"]', '[role="listbox"]', '[role="spinbutton"]',
    '[role="slider"]', '[role="menu"]', '[role="tree"]', '[role="tablist"]'
].join(', ');

export class Hotkey {
    constructor(keyStr, action) {
        this.keyStr = keyStr;
        this.action = action;
        this.ignoreWhenEditing = editingHotkeys.includes(keyStr.toLowerCase());
        this.parseKeys(keyStr);
    }

    parseKeys(str) {
        this.key = '';
        this.modifiers = modifiers.reduce((obj, key) => ({
            [key]: false, ...obj
        }), {});
        str.toLowerCase().split('+').forEach(part => {
            if (modifiers.includes(part)) {
                this.modifiers[part] = true;
                return;
            }
            this.key = part;
        });
    }

    respondsTo(event) {
        return this.key === event.key.toLowerCase()
            && event.shiftKey === this.modifiers.shift
            && event.ctrlKey === this.modifiers.ctrl
            && event.altKey === this.modifiers.alt;
    }
}

export const hotkeys = [];

export function registerHotkey(hotkeyStr, action) {
    const hotkey = new Hotkey(hotkeyStr, action);
    hotkeys.push(hotkey);
    return hotkey;
}

function userHasTextSelected() {
    const sel = window.getSelection();
    return sel?.type === 'Range'
        && sel.toString().trim().length > 0;
}

function isUserEditing() {
    const el = document.activeElement;
    if (!el) return false;

    return el.tagName === 'SL-INPUT'
        || el.tagName === 'SL-TEXTAREA'
        || el.tagName === 'INPUT'
        || el.tagName === 'TEXTAREA'
        || el.isContentEditable
        || userHasTextSelected();
}

function navigationBelongsToControl(event) {
    if (!navigationHotkeys.includes(event.key.toLowerCase())) return false;
    return event.composedPath().some(element =>
        element instanceof Element
        && (element.matches(navigationControlSelector) || element.isContentEditable));
}

function onKeyDown(event) {
    if (dialog.isOpen) return;
    const hotkey = hotkeys.find(hk => hk.respondsTo(event));
    if (!hotkey) return;
    if (navigationBelongsToControl(event)) return;
    if (isUserEditing() && hotkey.ignoreWhenEditing) {
        log('user').debug(`User editing, ignoring hotkey ${hotkey.keyStr}`);
        return;
    }
    event.stopImmediatePropagation();
    event.preventDefault();
    log('user').info(`User pressed hotkey ${hotkey.keyStr}`);
    hotkey.action?.(event);
}

document.addEventListener('keydown', onKeyDown, { capture: true });
