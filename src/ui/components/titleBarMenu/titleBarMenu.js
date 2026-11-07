import ReactiveComponent from '../ReactiveComponent.js';
import { emit } from '../../../shared/htmlUtils.js';
import { watch } from '../../../shared/reactivity.js';

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

    createNestedMenu(parent, menu) {
        parent.setAttribute('data-has-submenu', '');
        const menuElement = this.createMenu(parent, menu);
        menuElement.setAttribute('slot', 'submenu');
    }

    createMenuItem(item) {
        const menuItem = document.createElement('sl-menu-item');
        menuItem.value = item.value;
        menuItem.addEventListener('click', item.action);
        menuItem.innerHTML = (
            `<div class="menu-item">
                <div>${item.label}</div>
                <div>${item.hotkey || ''}</div>
            </div>`
        );
        if (item.items) this.createNestedMenu(menuItem, item);
        return menuItem;
    }

    appendChildren(element, items) {
        items.forEach(item => {
            const itemElement = item.isDivider
                ? this.createDivider()
                : this.createMenuItem(item);
            element.appendChild(itemElement);
        });
    }

    createMenu(dropdown, menu) {
        const menuElement = document.createElement('sl-menu');
        const items = menu.items.constructor === Function
            ? menu.items()
            : menu.items;
        watch(items, '', () => {
            menuElement.replaceChildren();
            this.appendChildren(menuElement, items);
        });
        this.appendChildren(menuElement, items);
        dropdown.appendChild(menuElement);
        return menuElement;
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
