import Alpine from 'alpinejs';
import html from './editCard.html';
import { buildCard } from '../../templateBuilder';

Alpine.data('editCard', (activeCard) => ({
    async init() {
        this.$root.innerHTML = html;

        this.card = await buildCard(activeCard.template);
        for (const face of Object.values(this.card.model))
            await face.load(activeCard.model[face.id]);

        Alpine.initTree(this.$root);
    },
    async save() {
        for (const face of Object.values(this.card.model))
            activeCard.model[face.id] = await face.save();
    },
    async close() {
        await this.save();
        Alpine.store('views').hide('activeCard');
    }
}));
