import Alpine from 'alpinejs';
import html from './cropImageModal.html';

Alpine.data('cropImageModal', () => ({
    async init() {
        this.$root.innerHTML = html;
        this.image = Alpine.store('views').activeImage;
        Alpine.initTree(this.$root);
    },
    closeModal() {
        Alpine.store('views').activeModal = null;
    }
}));
