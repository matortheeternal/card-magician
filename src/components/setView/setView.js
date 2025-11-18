import Alpine from 'alpinejs';
import html from './setView.html';
import { registerAction, executeAction } from '../../services/actionRegistry.js';
import { loadJson } from '../../services/fsHelpers.js';
import appConfig from '../../appConfig';
import { buildCard } from '../../services/cardBuilder.js';

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

    async setActiveCard(views) {
        const card = await buildCard(views.selectedCard.model);
        views.activeCard = Alpine.reactive(card);
    },

    async selectCard(selectedCard) {
        const views = Alpine.store('views');
        views.selectedCard = selectedCard;
        await this.setActiveCard(views);
    },

    bindEvents() {
        this.$root.addEventListener('row-selected', (event) => {
            event.stopPropagation();
            const { row } = event.detail;
            console.log('%cSelected card:', 'color:orange', row.data.name);
            this.selectCard(row.original);
        });

        registerAction('new-set', this.newSet);
        registerAction('add-card', this.addCard);
        registerAction('open-set', this.openSet);
        registerAction('delete-selected-cards', this.deleteSelectedCards);
    },

    newSet() {
        const views = Alpine.store('views');
        views.setFilePath = null;
        views.activeSet = { cards: [] };
        views.activeCard = {};
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

    async openSet(filePath = null) {
        filePath = filePath || await openSingleFileDialog();
        if (!filePath) return;
        console.info('Opening set:', filePath);
        const views = Alpine.store('views');
        views.setFilePath = filePath;
        views.activeSet = await loadJson(filePath);
        appConfig.addRecentFile(filePath);
    }
}));

async function openSingleFileDialog() {
    const res = await Neutralino.os.showOpenDialog('Open a set', {
        filters: [
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'All files', extensions: ['*'] }
        ]
    });
    if (!res) return;
    return res[0];
}
