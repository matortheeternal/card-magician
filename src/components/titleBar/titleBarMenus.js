import Alpine from 'alpinejs';
import { saveJson } from '../../fsHelpers';
import { executeAction } from '../../actionRegistry';

function menuItem(label, hotkey, action) {
    return { label, value: label.toCamelCase(), hotkey, action };
}

const DIVIDER = { isDivider: true };

async function saveAs() {
    const views = Alpine.store('views');
    const filePath = await Neutralino.os.showSaveDialog('Save set to file', {
        defaultPath: `${activeSet.title || 'My Set'}.json`,
        filters: [
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'All files', extensions: ['*'] }
        ]
    });
    if (!filePath) return;
    console.info('Saving set to:', filePath);
    views.setFilePath = filePath;
    await saveJson(filePath, views.activeSet, false);
}

const actions = {
    makeNewSet: () => console.log('Make new set'),
    openSet: () => executeAction('open-set'),
    save: async () => {
        const { activeSet, setFilePath } = Alpine.store('views');
        if (!setFilePath) return await saveAs();
        console.info('Saving set to:', setFilePath);
        await saveJson(setFilePath, activeSet, false);
    },
    saveAs: saveAs,
    exportAs: () => executeAction('export-card-image'),
    print: () => console.log('Print'),
    exit: () => Neutralino.app.exit(0),
    undo: () => console.log('Undo'),
    redo: () => console.log('Redo'),
    cut: () => console.log('Cut'),
    copy: () => console.log('Copy'),
    paste: () => console.log('Paste'),
    editPreferences: () => console.log('Edit preferences'),
    editSetInfo: () => console.log('Edit Set Info'),
    addCard: () => executeAction('add-card'),
    deleteCards: () => executeAction('delete-selected-cards'),
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
