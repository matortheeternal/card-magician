import Alpine from 'alpinejs';
import html from './displayCard.html';

Alpine.data('displayCard', () => ({
    async init() {
        this.$root.innerHTML = html;
        this.$watch('$store.views.activeCard', (newValue) => {
            this.card = newValue;
        });
        this.card = Alpine.store('views').activeCard || {};
        Alpine.initTree(this.$root);
    },
    async save() {
        const selectedCard = Alpine.store('views').selectedCard;
        for (const face of Object.values(this.card.model))
            selectedCard.model[face.id] = await face.save();
    }
}));
