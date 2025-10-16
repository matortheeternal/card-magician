import Alpine from 'alpinejs';
import html from './setView.html';
import { buildCard } from '../../templateBuilder';
import { registerAction, executeAction } from '../../actionRegistry';
import { loadJson } from '../../fsHelpers';
import appConfig from '../../appConfig';

Alpine.data('setView', () => ({
    rows: [],
    columns: [],
    recentSets: appConfig.recentFiles,

    async init() {
        this.$root.innerHTML = html;
        this.columns = Alpine.store('game').columns;
        this.rows = Alpine.store('views').activeSet.cards;

        this.$watch('$store.views.activeSet', (set) => {
            const cards = set.cards || [];
            this.rows.splice(0, this.rows.length, ...cards);
        });

        this.$watch('$store.appConfig.recentFiles', (recentFiles) => {
            this.recentFiles = recentFiles.slice(0, 4);
        })

        this.bindEvents();
        Alpine.initTree(this.$root);
    },

    async selectCard(selectedCard) {
        const views = Alpine.store('views');
        views.selectedCard = selectedCard;
        const card = await buildCard(selectedCard.template);
        for (const face of Object.values(card.model))
            await face.load(selectedCard.model[face.id]);
        views.activeCard = Alpine.reactive(card);
    },

    bindEvents() {
        this.$root.addEventListener('row-selected', (event) => {
            event.stopPropagation();
            const { row } = event.detail;
            this.selectCard(row.original);
        });

        registerAction('add-card', this.addCard);
        registerAction('open-set', this.openSet);
        registerAction('delete-selected-cards', this.deleteSelectedCards);
    },

    deleteSelectedCards() {
        const { activeSet } = Alpine.store('views');
        executeAction('get-listview-selection').forEach(r => {
            const index = activeSet.cards.indexOf(r.original);
            if (index === -1) {
                console.warn(`Couldn't find card:`, r.original);
                return;
            }
            activeSet.cards.splice(index, 1);
        });
    },

    addCard() {
        const game = Alpine.store('game');
        const { activeSet } = Alpine.store('views');
        activeSet.cards.push(game.newCard());
    },

    async openSet(filePath) {
        filePath = filePath || await Neutralino.os.showOpenDialog('Open a set', {
            filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All files', extensions: ['*'] }
            ]
        });
        if (!filePath) return;
        console.info('Opening set:', filePath);
        Alpine.store('views').activeSet = await loadJson(filePath);
        appConfig.addRecentFile(filePath);
    }
}));
