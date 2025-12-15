import Alpine from 'alpinejs';
import { executeAction } from '../../systems/actionSystem.js';
import { registerHotkey } from '../../systems/hotkeySystem.js';

const L = localize('title-bar');

function menuItem(label, hotkey, action) {
    if (hotkey !== '') registerHotkey(hotkey, action);
    return { label, value: label.toCamelCase(), hotkey, action };
}

const DIVIDER = { isDivider: true };

const actions = {
    makeNewSet: () => executeAction('new-set'),
    openSet: () => executeAction('open-set'),
    save: () => executeAction('save-set'),
    saveAs: () => executeAction('save-set-as'),
    exportAs: () => executeAction('export-card-image'),
    print: () => console.log('Print'),
    exit: () => Neutralino.app.exit(0),
    undo: () => console.log('Undo'),
    redo: () => console.log('Redo'),
    find: () => executeAction('toggle-search'),
    cut: () => executeAction('cut'),
    copy: () => executeAction('copy'),
    paste: () => executeAction('paste'),
    editPreferences: () => console.log('Edit preferences'),
    editLocales: () => (Alpine.store('views').activeModal = 'edit-locales'),
    editSetInfo: () => (Alpine.store('views').activeModal = 'set-info'),
    addCard: () => executeAction('add-card'),
    deleteCards: () => executeAction('delete-selected-cards'),
};

export const titleBarMenus = [{
    title: L`File`,
    items: [
        menuItem(L`New`, L`Ctrl+N`, actions.makeNewSet),
        menuItem(L`Open`, L`Ctrl+O`, actions.openSet),
        menuItem(L`Save`, L`Ctrl+S`, actions.save),
        menuItem(L`Save as`, L`Ctrl+Shift+S`, actions.saveAs),
        menuItem(L`Export`, L`Ctrl+Shift+E`, actions.exportAs),
        DIVIDER,
        menuItem(L`Print`, L`Ctrl+P`, actions.print),
        DIVIDER,
        menuItem(L`Exit`, ``, actions.exit),
    ]
}, {
    title: L`Edit`,
    items: [
        menuItem(L`Undo`, L`Ctrl+Z`, actions.undo),
        menuItem(L`Redo`, L`Ctrl+Shift+Z`, actions.redo),
        DIVIDER,
        menuItem(L`Find`, L`Ctrl+F`, actions.find),
        menuItem(L`Cut`, L`Ctrl+X`, actions.cut),
        menuItem(L`Copy`, L`Ctrl+C`, actions.copy),
        menuItem(L`Paste`, L`Ctrl+V`, actions.paste),
        DIVIDER,
        menuItem(L`Set Info`, ``, actions.editSetInfo),
        menuItem(L`Preferences`, ``, actions.editPreferences),
        menuItem(L`Localization`, ``, actions.editLocales),
    ]
}, {
    title: L`Cards`,
    items: [
        menuItem(L`Add Card`, L`Ctrl+Enter`, actions.addCard),
        menuItem(L`Delete Cards`, L`Delete`, actions.deleteCards),
    ]
}];

