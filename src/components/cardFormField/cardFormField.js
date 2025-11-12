import Alpine from 'alpinejs';

function submenu(option) {
    return `<sl-menu-item>
      ${option.name}
      <sl-menu slot="submenu">
        ${option.items.map(sub => `
          <sl-menu-item value="${sub.id}">${sub.name}</sl-menu-item>
        `).join('')}
      </sl-menu>
    </sl-menu-item>`;
}

function menuItem(option) {
    return `<sl-menu-item value="${option.id}">${option.name}</sl-menu-item>`;
}

function select(field, options) {
    return `<div class="sl-select-field">
        <div class="sl-field__label" @click="$el.nextElementSibling.show()">
            ${field.displayName}
        </div>
        <div>
            <sl-dropdown class="select-like" hoist sync="width">
                <sl-button slot="trigger" size="small" caret>
                    <span x-text="selectedLabel"></span>
                </sl-button>
                <sl-menu @sl-select="onItemSelected($event)">
                    ${options}
                </sl-menu>
            </sl-dropdown>
        </div>
    </div>`;
}

const HTMLMap = {
    textarea: field => (
        `<sl-textarea resize="auto" spellcheck="false" autocomplete="off"
                      rows="2" size="small" name="${field.id}" 
                      label="${field.displayName}" 
                      x-model="face.${field.id}"></sl-textarea>`
    ),
    select: field => (
        select(field, (
            field.options.map(option => {
                if (option.separator) return `<sl-divider></sl-divider>`;
                if (option.items) return submenu(option);
                return menuItem(option);
            }).join('')
        ))
    ),
    image: field => (
        `<image-select size="small" label="${field.displayName}" 
                       :src="face.${field.id}.image" 
                       x-model="face.${field.id}"
                       :filename="face.${field.id}.filename" 
                       :crop-width="face.${field.id}.width"
                       :crop-height="face.${field.id}.height"
                       :crop-x="face.${field.id}.xOffset"
                       :crop-y="face.${field.id}.yOffset"></image-select>`
    ),
    input: field => (
        `<sl-input autocomplete="off" size="small" type="${field.type || 'text'}" 
                   name="${field.id}" label="${field.displayName}" 
                   x-model="face.${field.id}"></sl-input>`
    )
};

function resolveItemLabel(field, initialValue) {
    if (!initialValue) return field.options[0].name;
    const options = field.options.flatMap(opt =>
        opt.items ? opt.items : [opt]
    ).filter(o => !o.separator);
    const foundOption = options.find(opt => opt.id === initialValue);
    return foundOption
        ? foundOption.name
        : field.options[0].name;
}

function updateSelectedClasses(root, selectedId) {
    root.querySelectorAll('sl-menu-item')
        .forEach(el => {
            const selected = el.getAttribute('value') === selectedId;
            el.classList.toggle('selected', selected);
            if (!selected) el.removeAttribute('checked');
            el.setAttribute('type', selected ? 'checkbox' : 'normal');
            if (selected) el.setAttribute('checked', true);
        });
}

Alpine.data('cardFormField', (field) => ({
    async init() {
        const initialValue = this.face[field.id];
        this.$root.innerHTML = HTMLMap[field.type || 'input'](field);
        if (field.type === 'select') {
            this.selectedLabel = resolveItemLabel(field, initialValue);
            updateSelectedClasses(this.$root, initialValue);
        }
        Alpine.initTree(this.$root);
    },

    onItemSelected(event) {
        const { item } = event.detail;
        this.face[field.id] = item.value;
        updateSelectedClasses(this.$root, item.value);
        this.selectedLabel = item.textContent.trim();
    },

    selectedLabel: '',
    field
}));
