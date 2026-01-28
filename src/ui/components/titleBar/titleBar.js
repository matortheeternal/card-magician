import ReactiveComponent from '../ReactiveComponent.js';
import FileMenu from '../../menus/FileMenu.js';
import EditMenu from '../../menus/EditMenu.js';
import CardsMenu from '../../menus/CardMenu.js';
import ExportMenu from '../../menus/ExportMenu.js';

const titleBarMenus = [
    new FileMenu(),
    new EditMenu(),
    new CardsMenu(),
    new ExportMenu(),
];

export default class TitleBar extends ReactiveComponent {
    openMenu = null;

    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        this.addEventListener('sl-hide', event => this.onMenuHide(event));
        this.addEventListener('sl-show', event => this.onMenuShow(event));
        this.addEventListener('trigger-enter', el => this.onTriggerEnter(el));
    }

    get menusContainer() {
        return this.querySelector('.menus-container');
    }

    renderMenus() {
        titleBarMenus.forEach(menu => {
            const menuElement = document.createElement('title-bar-menu');
            menuElement.menu = menu;
            this.menusContainer.appendChild(menuElement);
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

    onTriggerEnter(triggerElement) {
        const menu = triggerElement.closest('sl-dropdown');
        if (!this.openMenu || this.openMenu === menu) return;
        this.openMenu.hide();
        menu.show();
    }
}

customElements.define('cm-title-bar', TitleBar);
