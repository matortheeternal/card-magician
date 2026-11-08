import FieldComponent from './FieldComponent.js';
import { registerField } from '../../systems/fieldComponentRegistry.js';

const menuDividerSpacing = '--spacing: var(--sl-spacing-3x-small)';

function menuPrefixIcon(option) {
    if (!option || !option.imageUrl) return '';
    return `<img class="icon" slot="prefix" src="${option.imageUrl}" />`;
}

function submenu(option) {
    return `<sl-menu-item data-id="${option.id}" data-has-submenu>
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

function buildMenuHTML(label, options) {
    const optionsHTML = (options || []).map(option => {
        if (option.separator)
            return `<sl-divider style="${menuDividerSpacing}"></sl-divider>`;

        if (option.items)
            return submenu(option);

        return menuItem(option);
    }).join('');

    const optionsHaveIcons = options.some(opt => Boolean(opt.imageUrl));
    const className = [
        'sl-select-field',
        optionsHaveIcons ? ['has-icons'] : []
    ].flat().join(' ');
    return(
        `<div class="${className}">
             <div class="sl-field__label">${label ?? ''}</div>
             <sl-dropdown class="select-like" hoist sync="width">
                 <sl-button slot="trigger" size="small" caret></sl-button>
                 <sl-menu>${optionsHTML}</sl-menu>
             </sl-dropdown>
         </div>`
    );
}

function resolveOptionAndParent(selectedOption, options) {
    if (!selectedOption || !Array.isArray(options)) return [null, null];

    for (const option of options) {
        if (option.id === selectedOption) return [option, null];
        if (!option.items) continue;
        const item = option.items.find(item => item.id === selectedOption);
        if (item) return [item, option];
    }
    return [null, null];
}

function buildTriggerHTML(option, parent, rawValue) {
    if (!option) {
        return rawValue
            ? `<span class="unknown-value">ERROR: ${rawValue}</span>`
            : `<span class="no-selection">No Selection</span>`;
    }
    let html = menuPrefixIcon(option);
    if (parent) html += parent.name + ' / ';
    return html + option.name;
}

export default class NestedMenuField extends FieldComponent {
    static tagName = 'cm-nested-menu';
    eventKey = 'sl-select';

    static matches(field) {
        return field.type === 'nested-menu';
    }

    render() {
        this.innerHTML = buildMenuHTML(this.field.label, this.field.options);
        this.loadValue();
    }

    isSelected(el, groupId) {
        const itemId = el.getAttribute('data-id');
        return itemId === this.value
            || itemId === groupId;
    }

    updateSelectedClasses(groupId) {
        this.querySelectorAll('sl-menu-item').forEach(el => {
            el.classList.toggle('selected', this.isSelected(el, groupId));
        });
    }

    renderTriggerButton(option, parent) {
        const triggerButton = this.querySelector(`sl-button[slot="trigger"]`);
        if (!triggerButton) return;
        triggerButton.innerHTML = buildTriggerHTML(option, parent, this.value);
    }

    loadValue() {
        const [option, parent] = resolveOptionAndParent(
            this.value?.id || this.value,
            this.field.options
        );
        this.renderTriggerButton(option, parent);
        this.updateSelectedClasses(parent?.id);
    }

    async getChangedValue(event) {
        return event.detail?.item?.value || this.value;
    }
}

registerField(NestedMenuField);
