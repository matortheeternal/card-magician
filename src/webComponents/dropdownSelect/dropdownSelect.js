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

function updateSelectedClasses(root, selectedId, groupId) {
    if (!root) return;
    root.querySelectorAll("sl-menu-item").forEach(el => {
        const itemId = el.getAttribute('data-id');
        if (!itemId) return;
        const isSelected = itemId === selectedId || itemId === groupId;
        el.classList.toggle("selected", isSelected);
    });
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

function getOptionHTML(option, parent, rawValue) {
    if (!option) {
        return `<span class="error">ERROR: ${rawValue ?? ""}</span>`;
    }
    let html = menuPrefixIcon(option);
    if (parent) html += parent.name + ' / ';
    return html + option.name;
}

class DropdownSelect extends HTMLElement {
    constructor() {
        super();
        this._options = [];
        this._value = '';
        this.handleSelect = this.handleSelect.bind(this);
    }

    static get observedAttributes() {
        return ['label', 'name', 'value'];
    }

    get label() {
        return this.getAttribute('label') || '';
    }

    get value() {
        return this._value;
    }

    set value(v) {
        const newVal = v == null ? '' : String(v);
        if (newVal === this._value) return;
        this._value = newVal;
        this.setAttribute('value', newVal);
        this.loadValue();
    }

    get options() {
        return this._options;
    }

    set options(opts) {
        this._options = Array.isArray(opts) ? opts : [];
        this.render();
    }

    connectedCallback() {
        this._value = this.getAttribute('value') ?? '';
        this.render();
    }

    disconnectedCallback() {
        const menu = this.querySelector('sl-menu');
        if (!menu) return;
        menu.removeEventListener('sl-select', this.handleSelect);
    }

    render() {
        this.innerHTML = buildSelectHTML(this.label, this._options);

        const menu = this.querySelector('sl-menu');
        if (menu) {
            menu.removeEventListener('sl-select', this.handleSelect);
            menu.addEventListener('sl-select', this.handleSelect);
        }

        this.loadValue();
    }

    loadValue() {
        const dropdownRoot = this;
        const triggerButton = this.querySelector(`sl-button[slot="trigger"]`);
        if (!triggerButton) return;

        const [option, parent] = resolveOption(this._value, this._options);
        triggerButton.innerHTML = getOptionHTML(option, parent, this._value);

        updateSelectedClasses(dropdownRoot, this._value, parent?.id);
    }

    handleSelect(event) {
        const { item } = event.detail || {};
        if (!item) return;
        this.value = item.value;

        this.dispatchEvent(
            new CustomEvent('change', {
                bubbles: true,
                composed: true,
                detail: { value: this.value },
            })
        );
    }
}

customElements.define('cm-select', DropdownSelect);
