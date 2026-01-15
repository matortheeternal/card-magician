import ReactiveComponent from '../ReactiveComponent.js';
import { titleBarMenus } from './titleBarMenus.js';

export default class TitleBar extends ReactiveComponent {
    openMenu = null;

    connectedCallback() {
        this.render();
    }

    createDropdown() {
        const dropdown = document.createElement('sl-dropdown');
        dropdown.addEventListener('sl-hide', event => this.onMenuHide(event));
        dropdown.addEventListener('sl-show', event => this.onMenuShow(event));
        return dropdown;
    }

    createTrigger(dropdown, title) {
        const trigger = document.createElement('sl-button');
        trigger.size = 'small';
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

    renderMenus() {
        titleBarMenus.forEach(menu => {
            const dropdown = this.createDropdown();
            this.createTrigger(dropdown, menu.title);
            this.createMenu(dropdown, menu.items);
            this.menusContainer.appendChild(dropdown);
        });
    }

    render() {
        this.innerHTML = `<div class="menus-container"></div>`;
        this.renderMenus();
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
