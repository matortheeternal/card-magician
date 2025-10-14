import Alpine from 'alpinejs';
import { titleBarMenus } from './titleBarMenus.js';
import html from './titleBar.html';

Alpine.data('titleBar', () => ({
    async init() {
        this.$root.innerHTML = html;
        Alpine.initTree(this.$root);
    },
    openMenu: null,
    isMaximized: false,
    menus: titleBarMenus,
    menuHidden({ target: menu }) {
        menu.classList.remove('menu-active');
        if (this.openMenu === menu) this.openMenu = null;
    },
    menuShown({ target: menu }) {
        if (this.openMenu && this.openMenu !== menu) this.openMenu.hide();
        this.openMenu = menu;
        menu.classList.add('menu-active');
    },
    onMenuEnter({ target: button }) {
        const menu = button.parentNode;
        if (!this.openMenu || this.openMenu === menu) return;
        this.openMenu.hide();
        menu.show();
    },
    async toggleMaximize() {
        this.isMaximized
            ? await Neutralino.window.unmaximize()
            : await Neutralino.window.maximize();
        this.isMaximized = await Neutralino.window.isMaximized();
    },
}));
