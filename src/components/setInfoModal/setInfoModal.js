import Alpine from 'alpinejs';
import html from './setInfoModal.html';

Alpine.data('setInfoModal', () => ({
    async init() {
        this.$root.innerHTML = html;
        const views = Alpine.store('views');
        this.game = Alpine.store('game');
        this.set = views.activeSet;
        Alpine.initTree(this.$root);
    },
    closeModal() {
        Alpine.store('views').activeModal = null;
    }
}));
