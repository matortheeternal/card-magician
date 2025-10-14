import Alpine from 'alpinejs';
import html from './setView.html';

Alpine.data('setView', () => ({
    gridRows: [],
    gridColumns: [],

    async init() {
        this.$root.innerHTML = html;
        this.gridColumns = Alpine.store('game').gridColumns;
        this.gridRows = Alpine.store('views').activeSet.cards;

        this.$watch('$store.views.activeSet', (set) => {
            const cards = set.cards || [];
            this.gridRows.splice(0, this.gridRows.length, ...cards);
        });

        Alpine.initTree(this.$root);
    }
}));
