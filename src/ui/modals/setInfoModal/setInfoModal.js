import Alpine from 'alpinejs';
import html from './setInfoModal.html';

Alpine.data('setInfoModal', () => ({
    async init() {
        this.$root.innerHTML = html;
        const views = Alpine.store('views');
        this.game = Alpine.store('game');
        this.set = views.activeSet;
        this.$root.addEventListener('change', e => {
            const infoId = e.target.dataset?.infoId;
            if (!infoId) return;
            this.set.info[infoId] = e.target.value;
        });
        Alpine.initTree(this.$root);
    },

    closeModal() {
        Alpine.store('views').activeModal = null;
    }
}));
