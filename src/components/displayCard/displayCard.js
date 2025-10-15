import Alpine from 'alpinejs';
import html from './displayCard.html';

Alpine.data('displayCard', () => ({
    async init() {
        this.$root.innerHTML = html;
        this.card = Alpine.store('views').activeCard
        this.$watch('$store.views.activeCard', (newValue) => {
            this.card = newValue;
        });;
        Alpine.initTree(this.$root);
    }
}));
