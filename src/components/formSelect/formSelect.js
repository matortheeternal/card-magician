import Alpine from 'alpinejs';
import { emit } from '../../utils.js';

const selectDividerSpacing = "--spacing: var(--sl-spacing-3x-small)";

function menuPrefixIcon(option) {
    if (!option.imageURL) return '';
    return `<img class="icon" slot="prefix" src="${option.imageURL}" />`;
}

function submenu(option) {
    return `<sl-menu-item data-id="${option.id}">
        ${menuPrefixIcon(option.items[0])}
        ${option.name}
        <sl-menu slot="submenu">
            ${option.items.map(sub => menuItem(sub)).join('')}
        </sl-menu>
    </sl-menu-item>`;
}

function menuItem(option) {
    return `<sl-menu-item value="${option.id}" data-id="${option.id}">
        ${menuPrefixIcon(option)}
        ${option.name}
    </sl-menu-item>`;
}

function buildSelectHTML(field) {
    const optionsHTML = field.options.map(option => {
        if (option.separator)
            return `<sl-divider style="${selectDividerSpacing}"></sl-divider>`;
        if (option.items)
            return submenu(option);
        return menuItem(option);
    }).join('');

    return `
    <div class="sl-select-field">
        <div class="sl-field__label">${field.displayName}</div>
        <sl-dropdown class="select-like" hoist sync="width">
            <sl-button slot="trigger" size="small" x-html="triggerHTML" caret></sl-button>
                <sl-menu @sl-select="onItemSelected($event)">
                ${optionsHTML}
            </sl-menu>
        </sl-dropdown>
    </div>`;
}

function updateSelectedClasses(root, selectedId, groupId) {
    root.querySelectorAll('sl-menu-item').forEach(el => {
        const itemId = el.getAttribute('data-id');
        if (!itemId) return;
        const isSelected = itemId === selectedId || itemId === groupId;
        el.classList.toggle('selected', isSelected);
    });
}

function getOptionHTML(option, parent) {
    if (!option)
        return `<span class="error">ERROR: ${selectedValue}</span>`;
    let html = menuPrefixIcon(option);
    if (parent) html += parent.name + ' / ';
    return html + option.name;
}

function resolveOption(selectedValue, field) {
    for (const option of field.options) {
        if (option.id === selectedValue) return [option, null];
        if (!option.items) continue;
        for (const item of option.items)
            if (item.id === selectedValue) return [item, option];
    }
}

Alpine.data('formSelect', ({ field, face }) => ({
    field,
    face,
    triggerHTML: '',
    selectedLabel: '',

    init() {
        this.$root.innerHTML = buildSelectHTML(field);

        const initialValue = this.face[field.id];
        const [option, parent] = resolveOption(initialValue, field);
        this.triggerHTML = getOptionHTML(option, parent);
        updateSelectedClasses(this.$root, initialValue, parent?.id);

        Alpine.initTree(this.$root);
    },

    onItemSelected(event) {
        const { item } = event.detail;
        this.face[this.field.id] = item.value;
        const [option, parent] = resolveOption(item.value, field);
        this.triggerHTML = getOptionHTML(option, parent);
        updateSelectedClasses(this.$root, item.value, parent?.id);
        emit(this.$root, 'change');
    }
}));
