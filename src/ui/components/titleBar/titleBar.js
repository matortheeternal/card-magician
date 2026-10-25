import ReactiveComponent from '../ReactiveComponent.js';
import FileMenu from '../../menus/FileMenu.js';
import EditMenu from '../../menus/EditMenu.js';
import CardsMenu from '../../menus/CardMenu.js';
import ExportMenu from '../../menus/ExportMenu.js';
import { openUrl } from '../../../shared/neutralinoAdapter.js';

const L = localize('titleBar');

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
        this.handleEvents('click', {
            showErrors: () => {},
            joinDiscord: () => openUrl('https://discord.gg/abAeJKNhKt'),
            openKofi: () => openUrl('https://ko-fi.com/mator')
        });
        this.addEventListener('sl-hide', event => this.onMenuHide(event));
        this.addEventListener('sl-show', event => this.onMenuShow(event));
        this.addEventListener('trigger-enter', event => this.onTriggerEnter(event));
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
        this.innerHTML = (
            `<div class="menus-container"></div>
            <div>
                <cm-errors-dropdown></cm-errors-dropdown>
                <sl-button
                    size="small"
                    class="discord-button"
                    data-click-action="joinDiscord"
                >
                    <sl-icon slot="prefix" name="discord"></sl-icon>
                    ${L`Join the Discord!`}
                </sl-button>
                <sl-button
                    size="small"
                    class="support-button"
                    data-click-action="openKofi"
                >
                    <sl-icon slot="prefix" name="heart"></sl-icon>
                    ${L`Support this project`}
                </sl-button>
            </div>`
        );
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

    onTriggerEnter(event) {
        const menu = event.detail.closest('sl-dropdown');
        if (!this.openMenu || this.openMenu === menu) return;
        this.openMenu.hide();
        menu.show();
    }
}

customElements.define('cm-title-bar', TitleBar);
