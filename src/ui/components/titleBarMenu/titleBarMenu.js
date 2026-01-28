import ReactiveComponent from '../ReactiveComponent.js';
import { emit } from '../../../shared/htmlUtils.js';

export default class TitleBarMenu extends ReactiveComponent {
    #menu;

    connectedCallback() {
        this.render();
    }

    set menu(newValue) {
        this.#menu = newValue;
        this.setAttribute('data-menu-id', newValue.id);
        this.watch('menu', newValue, '', () => this.render());
    }

    get menu() {
        return this.#menu;
    }

    createTrigger(dropdown, title) {
        const trigger = document.createElement('sl-button');
        trigger.addEventListener('mouseenter', () => {
            emit(this, 'trigger-enter', trigger);
        });
        trigger.size = 'small';
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

    createMenu(dropdown, menu) {
        const menuElement = document.createElement('sl-menu');
        menu.items.forEach(item => {
            const itemElement = item.isDivider
                ? this.createDivider()
                : this.createMenuItem(item);
            menuElement.appendChild(itemElement);
        });
        dropdown.appendChild(menuElement);
    }

    render() {
        this.innerHTML = '';
        const dropdown = document.createElement('sl-dropdown');
        this.createTrigger(dropdown, this.menu.title);
        this.createMenu(dropdown, this.menu);
        this.appendChild(dropdown);
    }
}

customElements.define('title-bar-menu', TitleBarMenu);
