import Alpine from 'alpinejs';
import html from './displayCard.html';

Alpine.data('displayCard', () => ({
    hasCard: false,
    async init() {
        this.$root.innerHTML = html;
        this.$watch('$store.views.activeCard', (newValue, oldValue) => {
            if (newValue === oldValue) return;
            this.hasCard = false;
            Alpine.nextTick(() => {
                this.hasCard = true;
                this.card = newValue;
            });
        });
        Alpine.initTree(this.$root);
    }
}));
