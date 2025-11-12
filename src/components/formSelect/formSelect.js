import Alpine from 'alpinejs';

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
      <div class="sl-field__label" @click="$el.nextElementSibling.show()">
        ${field.displayName}
      </div>
      <div>
        <sl-dropdown class="select-like" hoist sync="width">
          <sl-button slot="trigger" size="small" caret>
            <span x-text="selectedLabel"></span>
          </sl-button>
          <sl-menu @sl-select="onItemSelected($event)">
            ${optionsHTML}
          </sl-menu>
        </sl-dropdown>
      </div>
    </div>`;
}

function resolveItemLabel(field, initialValue) {
    if (!initialValue) return field.options[0].name;
    const options = field.options
        .flatMap(opt => (opt.items ? opt.items : [opt]))
        .filter(o => !o.separator);
    const found = options.find(o => o.id === initialValue);
    return found ? found.name : field.options[0].name;
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

Alpine.data('formSelect', ({ field, face }) => ({
    field,
    face,
    selectedLabel: '',

    init() {
        this.$root.innerHTML = buildSelectHTML(field);

        const initialValue = this.face[field.id];
        this.selectedLabel = resolveItemLabel(field, initialValue);
        updateSelectedClasses(this.$root, initialValue);

        Alpine.initTree(this.$root);
    },

    onItemSelected(event) {
        const { item } = event.detail;
        this.face[this.field.id] = item.value;
        this.selectedLabel = item.textContent.trim();
        updateSelectedClasses(this.$root, item.value);
    }
}));
