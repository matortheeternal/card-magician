import Alpine from 'alpinejs';
import { emit } from '../../utils.js';

const selectDividerSpacing = "--spacing: var(--sl-spacing-3x-small)";

function menuPrefixIcon(option) {
    if (!option.imageURL) return '';
    return `<img class="icon" slot="prefix" src="${option.imageURL}" />`;
}

function submenu(option) {
    return `<sl-menu-item>
        ${menuPrefixIcon(option.items[0])}
        ${option.name}
        <sl-menu slot="submenu">
            ${option.items.map(sub => menuItem(sub)).join('')}
        </sl-menu>
    </sl-menu-item>`;
}

function menuItem(option) {
    return `<sl-menu-item value="${option.id}">
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

function updateSelectedClasses(root, selectedId) {
    root.querySelectorAll('sl-menu-item').forEach(el => {
        const isSelected = el.getAttribute('value') === selectedId;
        el.classList.toggle('selected', isSelected);
        if (!isSelected) el.removeAttribute('checked');
        el.setAttribute('type', isSelected ? 'checkbox' : 'normal');
        if (isSelected) el.setAttribute('checked', true);
    });
}

function getOptionHTML(option, parent) {
    let html = menuPrefixIcon(option);
    if (parent) html += parent.name + ' / ';
    return html + option.name;
}

function getTriggerHTML(selectedValue, field) {
    for (const option of field.options) {
        if (option.id === selectedValue)
            return getOptionHTML(option);
        if (!option.items) continue;
        for (const item of option.items) {
            if (item.id === selectedValue)
                return getOptionHTML(item, option);
        }
    }
    return `<span class="error">ERROR: ${selectedValue}</span>`;
}

Alpine.data('formSelect', ({ field, face }) => ({
    field,
    face,
    triggerHTML: '',
    selectedLabel: '',

    init() {
        this.$root.innerHTML = buildSelectHTML(field);

        const initialValue = this.face[field.id];
        this.triggerHTML = getTriggerHTML(initialValue, field);
        updateSelectedClasses(this.$root, initialValue);

        Alpine.initTree(this.$root);
    },

    onItemSelected(event) {
        const { item } = event.detail;
        this.face[this.field.id] = item.value;
        this.triggerHTML = getTriggerHTML(item.value, field);
        updateSelectedClasses(this.$root, item.value);
        emit(this.$root, 'change');
    }
}));
