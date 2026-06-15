import ReactiveComponent from '../ReactiveComponent.js';
import FileMenu from '../../menus/FileMenu.js';
import EditMenu from '../../menus/EditMenu.js';
import CardsMenu from '../../menus/CardMenu.js';
import ExportMenu from '../../menus/ExportMenu.js';

const menus = [
    new FileMenu(),
    new EditMenu(),
    new CardsMenu(),
    new ExportMenu(),
];

export default class MobileMenu extends ReactiveComponent {
    connectedCallback() {
        this.render();
    }

    get items() {
        const items = [];
        menus.forEach((menu, index) => {
            if (index > 0) items.push(menu.DIVIDER);
            menu.items.forEach(item => {
                if (item.desktopOnly || item.isDivider) return;
                items.push(item);
            });
        });
        return items;
    }

    createDivider() {
        const divider = document.createElement('sl-divider');
        divider.style.setProperty('--spacing', '0.5rem');
        return divider;
    }

    createMenuItem(item) {
        const menuItem = document.createElement('sl-menu-item');
        menuItem.value = item.value;
        menuItem.addEventListener('touchend', item.action);
        menuItem.innerText = item.label;
        return menuItem;
    }

    render() {
        this.innerHTML = '';
        const menuElement = document.createElement('sl-menu');
        this.items.forEach(item => {
            const itemElement = item.isDivider
                ? this.createDivider()
                : this.createMenuItem(item);
            menuElement.appendChild(itemElement);
        });
        this.appendChild(menuElement);
    }
}

customElements.define('cm-mobile-menu', MobileMenu);
