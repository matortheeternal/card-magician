import Alpine from 'alpinejs';
import html from './displayCard.html';

Alpine.data('displayCard', (activeCard) => ({
    async init() {
        this.$root.innerHTML = html;
        this.card = activeCard;
        Alpine.initTree(this.$root);
    },
    async save() {
        const selectedCard = Alpine.store('views').selectedCard;
        for (const face of Object.values(this.card.model))
            selectedCard.model[face.id] = await face.save();
    }
}));
