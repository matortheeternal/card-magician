import Alpine from 'alpinejs';

Alpine.data('cardFace', (face) => ({
    async init() {
        Alpine.addScopeToNode(this.$root, face);
        this.$root.appendChild(face.dom);
        Alpine.initTree(this.$root);
    }
}));
