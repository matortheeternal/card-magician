import FieldElement from './fieldElement.js';
import { registerField } from '../../services/fieldElementRegistry.js';

const selectDividerSpacing = '--spacing: var(--sl-spacing-3x-small)';

function menuPrefixIcon(option) {
    if (!option || !option.imageURL) return '';
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

function buildSelectHTML(label, options) {
    const optionsHTML = (options || []).map(option => {
        if (option.separator) {
            return `<sl-divider style="${selectDividerSpacing}"></sl-divider>`;
        }
        if (option.items) {
            return submenu(option);
        }
        return menuItem(option);
    }).join('');

    const optionsHaveIcons = options.some(opt => Boolean(opt.imageURL));
    const className = [
        'sl-select-field',
        optionsHaveIcons ? ['has-icons'] : []
    ].flat().join(' ');
    return(
        `<div class="${className}">
             <div class="sl-field__label">${label ?? ""}</div>
             <sl-dropdown class="select-like" hoist sync="width">
                 <sl-button slot="trigger" size="small" caret></sl-button>
                 <sl-menu>${optionsHTML}</sl-menu>
             </sl-dropdown>
         </div>`
    );
}

function resolveOption(selectedValue, options) {
    if (!selectedValue || !Array.isArray(options)) return [null, null];

    for (const option of options) {
        if (option.id === selectedValue) return [option, null];
        if (!option.items) continue;
        for (const item of option.items) {
            if (item.id === selectedValue) return [item, option];
        }
    }
    return [null, null];
}

function buildTriggerHTML(option, parent, rawValue) {
    if (!option)
        return `<span class="error">ERROR: ${rawValue ?? ''}</span>`;
    let html = menuPrefixIcon(option);
    if (parent) html += parent.name + ' / ';
    return html + option.name;
}

export default class SelectField extends FieldElement {
    static tagName = 'cm-select';
    eventKey = 'sl-select';

    static matches(field) {
        return field.type === 'select';
    }

    render() {
        if (!this.field) return;
        this.innerHTML = buildSelectHTML(this.field.label, this.field.options);
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
        const [option, parent] = resolveOption(this.value, this.field.options);
        this.renderTriggerButton(option, parent);
        this.updateSelectedClasses(parent?.id);
    }

    getChangedValue(event) {
        return event.detail?.item?.value || this.value;
    }

    onChange(event) {
        super.onChange(event);
        this.loadValue();
    }
}

registerField(SelectField);
