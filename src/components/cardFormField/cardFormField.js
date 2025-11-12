import Alpine from 'alpinejs';

const HTMLMap = {
    textarea: field => (
        `<sl-textarea resize="auto" spellcheck="false" autocomplete="off"
                      rows="2" size="small" name="${field.id}" 
                      label="${field.displayName}" 
                      x-model="face.${field.id}"></sl-textarea>`
    ),
    select: () => (
        `<div x-data="formSelect({ field: $data.field, face })"></div>`
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

Alpine.data('cardFormField', (field) => ({
    async init() {
        this.$root.innerHTML = HTMLMap[field.type || 'input'](field);
        Alpine.initTree(this.$root);
    },

    field
}));
