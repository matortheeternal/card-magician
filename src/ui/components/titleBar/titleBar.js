import ReactiveComponent from '../ReactiveComponent.js';
import { titleBarMenus } from './titleBarMenus.js';
import html from './titleBar.html.js';
import {
    centerWindow, exitApp, getWindowPosition,
    getWindowSize, maximizeWindow, minimizeWindow, setDraggableRegion,
    setWindowSize,
    unmaximizeWindow
} from '../../../shared/neutralinoAdapter.js';
import { toggleDisplay } from '../../../shared/htmlUtils.js';

const L = localize('title-bar');

export default class TitleBar extends ReactiveComponent {
    openMenu = null;
    isMaximized = false;

    connectedCallback() {
        this.render();
        this.getIsMaximized().then(res => {
            this.setIsMaximized(res);
        });
        this.bind();
    }

    bind() {
        this.handleEvents('click', {
            exit: () => exitApp(),
            minimize: () => minimizeWindow(),
            toggleMaximize: () => this.toggleMaximize()
        });
    }

    createDropdown() {
        const dropdown = document.createElement('sl-dropdown');
        dropdown.addEventListener('sl-hide', event => this.onMenuHide(event));
        dropdown.addEventListener('sl-show', event => this.onMenuShow(event));
        return dropdown;
    }

    createTrigger(dropdown, title) {
        const trigger = document.createElement('sl-button');
        trigger.addEventListener('mouseenter', event => this.onMenuEnter(event));
        trigger.slot = 'trigger';
        trigger.textContent = title;
        dropdown.appendChild(trigger);
    }

    createDivider() {
        const divider = document.createElement('sl-divider');
        divider.style.setProperty('--spacing', '0.5rem');
        return divider;
    }

    createMenuItem(item) {
        const menuItem = document.createElement('sl-menu-item');
        menuItem.value = item.value;
        menuItem.addEventListener('click', item.action);
        menuItem.innerHTML = (
            `<div class="menu-item">
                <div>${item.label}</div>
                <div>${item.hotkey}</div>
            </div>`
        );
        return menuItem;
    }

    createMenu(dropdown, items) {
        const menu = document.createElement('sl-menu');
        items.forEach(item => {
            const itemElement = item.isDivider
                ? this.createDivider()
                : this.createMenuItem(item);
            menu.appendChild(itemElement);
        });
        dropdown.appendChild(menu);
    }

    get menusContainer() {
        return this.querySelector('.menus-container');
    }

    get toggleMaximizeButton() {
        return this.querySelector('#maximize-app');
    }

    renderMenus() {
        titleBarMenus.forEach(menu => {
            const dropdown = this.createDropdown();
            this.createTrigger(dropdown, menu.title);
            this.createMenu(dropdown, menu.items);
            this.menusContainer.appendChild(dropdown);
        });
    }

    makeDraggable() {
        setDraggableRegion(this.querySelector('.draggable'));
    }

    render() {
        this.innerHTML = html;
        this.renderMenus();
        this.makeDraggable();
    }

    setIsMaximized(value) {
        this.isMaximized = value;
        this.toggleMaximizeButton.title = value ? L`Restore` : L`Maximize`;
        const restoreIcon = this.toggleMaximizeButton.querySelector('svg');
        const maximizeIcon = this.toggleMaximizeButton.querySelector('sl-icon');
        toggleDisplay(value, restoreIcon, maximizeIcon);
    }

    async restore() {
        console.log('restore');
        const size = await getWindowSize();
        await unmaximizeWindow();
        await setWindowSize({
            width: size.minWidth,
            height: size.minHeight,
        });
        await centerWindow();
        this.setIsMaximized(false);
    }

    async maximize() {
        console.log('maximize');
        await maximizeWindow();
        this.setIsMaximized(true);
    }

    async toggleMaximize() {
        console.log('toggleMaximize', this.isMaxmized);
        return this.isMaximized
            ? await this.restore()
            : await this.maximize();
    }

    async getIsMaximized() {
        const pos = await getWindowPosition();
        const size = await getWindowSize();
        return pos.x < 0
            && pos.y < 0
            && size.height > window.screen.availHeight
            && size.width > window.screen.availWidth;
    }

    onMenuHide(event) {
        const menu = event.target;
        menu.classList.remove('menu-active');
        if (this.openMenu === menu) this.openMenu = null;
    }

    onMenuShow(event) {
        const menu = event.target;
        if (this.openMenu && this.openMenu !== menu)
            this.openMenu.hide();

        this.openMenu = menu;
        menu.classList.add('menu-active');
    }

    onMenuEnter(event) {
        const menu = event.target.parentNode;
        if (!this.openMenu || this.openMenu === menu) return;
        this.openMenu.hide();
        menu.show();
    }
}

customElements.define('cm-title-bar', TitleBar);
