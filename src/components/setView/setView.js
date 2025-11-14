import Alpine from 'alpinejs';
import html from './setView.html';
import { buildCard, remapFaces } from '../../templateBuilder';
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

    async setActiveCard(views) {
        const card = await buildCard(views.selectedCard.template);
        for (const face of Object.values(card.model))
            await face.load(views.selectedCard.model[face.id]);
        views.activeCard = Alpine.reactive(card);
    },

    async selectCard(selectedCard) {
        const views = Alpine.store('views');
        views.selectedCard = selectedCard;
        await this.setActiveCard(views);
    },

    async changeTemplate(newTemplate) {
        const views = Alpine.store('views');
        const oldTemplate = views.selectedCard.template;
        if (oldTemplate === newTemplate) return;
        views.selectedCard.template = newTemplate;
        remapFaces(views.selectedCard, oldTemplate, newTemplate);
        await this.setActiveCard(views);
    },

    bindEvents() {
        this.$root.addEventListener('row-selected', (event) => {
            event.stopPropagation();
            const { row } = event.detail;
            this.selectCard(row.original);
        });

        document.addEventListener('change-template', (event) => {
            event.stopPropagation();
            const { templateId } = event.detail;
            this.changeTemplate(templateId);
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
