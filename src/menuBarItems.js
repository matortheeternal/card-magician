function toCamelCase(str) {
    return str.split(' ').map((word, n) => {
        return n > 0
            ? word[0].toUpperCase() + word.slice(1).toLowerCase()
            : word.toLowerCase();
    });
}

function menuItem(label, hotkey, action) {
    const value = toCamelCase(label);
    return { label, value, hotkey, action };
}

const DIVIDER = { isDivider: true };

const actions = {
    makeNewSet: () => console.log('Make new set'),
    openSet: () => console.log('Open set'),
    saveAs: () => console.log('Save as'),
    print: () => console.log('Print'),
    exit: () => Neutralino.app.exit(0),
    undo: () => console.log('Undo'),
    redo: () => console.log('Redo'),
    cut: () => console.log('Cut'),
    copy: () => console.log('Copy'),
    paste: () => console.log('Paste'),
    editPreferences: () => console.log('Edit preferences'),
    addCard: () => console.log('Add card'),
    deleteCards: () => console.log('Delete cards'),
};

export const menuBarItems = [{
    title: 'File',
    items: [
        menuItem('New', 'Ctrl+N', actions.makeNewSet),
        menuItem('Open', 'Ctrl+O', actions.openSet),
        menuItem('Save as', 'Ctrl+Shift+S', actions.saveAs),
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
        menuItem('Preference', '', actions.editPreferences),
    ]
}, {
    title: 'Cards',
    items: [
        menuItem('Add Card', 'Ctrl+Enter', actions.addCard),
        menuItem('Delete Cards', 'Delete', actions.deleteCards),
    ]
}];d

let openMenu = null;
export const menuEvents = {
    menuHidden: ({ target: menu }) => {
        menu.classList.remove('menu-active');
        if (openMenu === menu) openMenu = null;
    },
    menuShown: ({ target: menu }) => {
        if (openMenu && openMenu !== menu) openMenu.hide();
        openMenu = menu;
        menu.classList.add('menu-active');
    },
    onMenuEnter: ({ target: button }) => {
        const menu = button.parentNode;
        if (!openMenu || openMenu === menu) return;
        openMenu.hide();
        menu.show();
    }
};
