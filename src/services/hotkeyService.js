const modifiers = ['ctrl', 'shift', 'alt'];

export class Hotkey {
    constructor(keyStr, action) {
        this.keyStr = keyStr;
        this.action = action;
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

function onKeyDown(event) {
    const hotkey = hotkeys.find(hk => hk.respondsTo(event));
    if (!hotkey) return;
    hotkey.action?.();
}

document.addEventListener('keydown', onKeyDown);
