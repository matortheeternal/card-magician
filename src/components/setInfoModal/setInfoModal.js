import Alpine from 'alpinejs';
import html from './setInfoModal.html';

Alpine.data('setInfoModal', () => ({
    async init() {
        this.$root.innerHTML = html;
        this.set = Alpine.store('views').activeSet;
        Alpine.initTree(this.$root);
        console.log(this.set);
    },
    closeModal() {
        Alpine.store('views').activeModal = null;
    }
}));
