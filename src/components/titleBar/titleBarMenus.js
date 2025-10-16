import Alpine from 'alpinejs';
import { toCamelCase } from '../../utils.js';
import { loadJson, saveJson } from '../../fsHelpers';
import { saveHTMLAsImage } from '../../gfx/imageProcessing';

function menuItem(label, hotkey, action) {
    const value = toCamelCase(label);
    return { label, value, hotkey, action };
}

const DIVIDER = { isDivider: true };

const actions = {
    makeNewSet: () => console.log('Make new set'),
    openSet: async () => {
        const [filePath] = await Neutralino.os.showOpenDialog('Open a set', {
            filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All files', extensions: ['*'] }
            ]
        });
        if (!filePath) return;
        console.info('Opening set:', filePath);
        Alpine.store('views').activeSet = await loadJson(filePath);
    },
    save: () => console.log('Save'),
    saveAs: async () => {
        const { activeSet } = Alpine.store('views');
        const filePath = await Neutralino.os.showSaveDialog('Save set to file', {
            defaultPath: `${activeSet.title || 'My Set'}.json`,
            filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All files', extensions: ['*'] }
            ]
        });
        if (!filePath) return;
        console.info('Saving set to:', filePath);
        await saveJson(filePath, activeSet, false);
    },
    exportAs: async () => {
        const cardNode = document.querySelector('.card-container');
        await saveHTMLAsImage(cardNode, 'card.png');
    },
    print: () => console.log('Print'),
    exit: () => Neutralino.app.exit(0),
    undo: () => console.log('Undo'),
    redo: () => console.log('Redo'),
    cut: () => console.log('Cut'),
    copy: () => console.log('Copy'),
    paste: () => console.log('Paste'),
    editPreferences: () => console.log('Edit preferences'),
    editSetInfo: () => console.log('Edit Set Info'),
    addCard: () => {
        const { activeSet } = Alpine.store('views');
        const game = Alpine.store('game');
        Alpine.nextTick(() => {
            activeSet.cards.push(game.newCard());
        });
    },
    deleteCards: () => console.log('Delete cards'),
};

export const titleBarMenus = [{
    title: 'File',
    items: [
        menuItem('New', 'Ctrl+N', actions.makeNewSet),
        menuItem('Open', 'Ctrl+O', actions.openSet),
        menuItem('Save', 'Ctrl+S', actions.save),
        menuItem('Save as', 'Ctrl+Shift+S', actions.saveAs),
        menuItem('Export', 'Ctrl+Shift+E', actions.exportAs),
        DIVIDER,
        menuItem('Print', 'Ctrl+P', actions.print),
        DIVIDER,
        menuItem('Exit', '', actions.exit),
    ]
}, {
    title: 'Edit',
    items: [
        menuItem('Undo', 'Ctrl+Z', actions.undo),
        menuItem('Redo', 'Ctrl+Shift+Z', actions.redo),
        DIVIDER,
        menuItem('Cut', 'Ctrl+Shift+S', actions.cut),
        menuItem('Copy', 'Ctrl+P', actions.copy),
        menuItem('Paste', '', actions.paste),
        DIVIDER,
        menuItem('Set Info', '', actions.editSetInfo),
        menuItem('Preferences', '', actions.editPreferences),
    ]
}, {
    title: 'Cards',
    items: [
        menuItem('Add Card', 'Ctrl+Enter', actions.addCard),
        menuItem('Delete Cards', 'Delete', actions.deleteCards),
    ]
}];
