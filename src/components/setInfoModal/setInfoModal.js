import Alpine from 'alpinejs';
import html from './setInfoModal.html';

Alpine.data('setInfoModal', () => ({
    async init() {
        this.$root.innerHTML = html;
        this.set = Alpine.store('views').activeSet;
        this.game = Alpine.store('game');
        document.getElementById('set-info-modal-body').innerHTML = this.game.renderSetInfo();
        Alpine.initTree(this.$root);
    },
    closeModal() {
        Alpine.store('views').activeModal = null;
    }
}));
