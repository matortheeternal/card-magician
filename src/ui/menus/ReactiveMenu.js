import { registerHotkey } from '../systems/hotkeySystem.js';

export default class ReactiveMenu {
    id;
    title;
    DIVIDER = { isDivider: true };

    menuItem(label, hotkey, action) {
        if (hotkey !== '') registerHotkey(hotkey, action);
        return { label, value: label.toCamelCase(), hotkey, action };
    }

    get items() {
        return [];
    }
}
