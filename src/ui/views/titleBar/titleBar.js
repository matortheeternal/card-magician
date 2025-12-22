import Alpine from 'alpinejs';
import { titleBarMenus } from './titleBarMenus.js';
import html from './titleBar.html';

Alpine.data('titleBar', () => ({
    openMenu: null,
    isMaximized: false,
    menus: titleBarMenus,

    async init() {
        this.$root.innerHTML = html;
        await this.detectMaximizeState();
        Alpine.initTree(this.$root);
        window.addEventListener('resize', () => this.detectMaximizeState());
    },

    async restore() {
        const size = await Neutralino.window.getSize();
        await Neutralino.window.unmaximize();
        await Neutralino.window.setSize({
            width: size.minWidth,
            height: size.minHeight,
        });
        await Neutralino.window.center();
        this.isMaximized = false;
    },

    async maximize() {
        await Neutralino.window.maximize();
        this.isMaximized = true;
    },

    async toggleMaximize() {
        return this.isMaximized
            ? await this.restore()
            : await this.maximize();
    },

    async getIsMaximized() {
        const pos = await Neutralino.window.getPosition();
        const size = await Neutralino.window.getSize();
        return pos.x < 0
            && pos.y < 0
            && size.height > window.screen.availHeight
            && size.width > window.screen.availWidth;
    },

    async detectMaximizeState() {
        this.isMaximized = await this.getIsMaximized();
    },

    menuHidden({ target: menu }) {
        menu.classList.remove('menu-active');
        if (this.openMenu === menu) this.openMenu = null;
    },

    menuShown({ target: menu }) {
        if (this.openMenu && this.openMenu !== menu) 
            this.openMenu.hide();
        
        this.openMenu = menu;
        menu.classList.add('menu-active');
    },

    onMenuEnter({ target: button }) {
        const menu = button.parentNode;
        if (!this.openMenu || this.openMenu === menu) return;
        this.openMenu.hide();
        menu.show();
    }
}));
