import Alpine from 'alpinejs';

const HTMLMap = {
    textarea: field => (
        `<sl-textarea resize="auto" spellcheck="false" 
                      label="${field.displayName}" 
                      x-model="face.${field.id}"></sl-textarea>`
    ),
    select: field => (
        `<sl-select label="${field.displayName}" x-model="face.${field.id}" x-sl-fix>` +
            field.options.map(option => (
                `<sl-option value="${option}">${option}</sl-option>`
            )).join('\n') +
        `</sl-select>`
    ),
    image: field => (
        `<image-select label="${field.displayName}" x-model="face.${field.id}" :src="face.${field.id}.image" :filename="face.${field.id}.filename"></image-select>`
    ),
    input: field => (
        `<sl-input type="${field.type || 'text'}" 
                   label="${field.displayName}" 
                   x-model="face.${field.id}"></sl-input>`
    )
};

Alpine.data('cardFormField', (field) => ({
    async init() {
        this.$root.innerHTML = HTMLMap[field.type || 'input'](field);
        Alpine.initTree(this.$root);
    },
    field
}));
