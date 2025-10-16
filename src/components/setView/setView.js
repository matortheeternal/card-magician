import Alpine from 'alpinejs';
import html from './setView.html';
import { buildCard } from '../../templateBuilder';

Alpine.data('setView', () => ({
    rows: [],
    columns: [],
    recentSets: [],

    async init() {
        this.$root.innerHTML = html;
        this.columns = Alpine.store('game').columns;
        this.rows = Alpine.store('views').activeSet.cards;

        this.$watch('$store.views.activeSet', (set) => {
            const cards = set.cards || [];
            this.rows.splice(0, this.rows.length, ...cards);
        });

        this.$root.addEventListener('row-selected', (event) => {
            event.stopPropagation();
            const { row } = event.detail;
            this.selectCard(row.original);
        });

        Alpine.initTree(this.$root);
    },

    async selectCard(selectedCard) {
        const views = Alpine.store('views');
        views.selectedCard = selectedCard;
        const card = await buildCard(selectedCard.template);
        for (const face of Object.values(card.model))
            await face.load(selectedCard.model[face.id]);
        views.activeCard = Alpine.reactive(card);
    }
}));
