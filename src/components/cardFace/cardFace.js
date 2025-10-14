import Alpine from 'alpinejs';

Alpine.data('cardFace', (face) => ({
    async init() {
        this.$root.appendChild(face.dom);
        Alpine.initTree(this.$root);
    },
    face
}));
