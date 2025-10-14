import Alpine from 'alpinejs';
import html from './cardForm.html';

Alpine.data('cardForm', (activeCard) => ({
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
