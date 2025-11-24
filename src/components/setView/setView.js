import Alpine from 'alpinejs';
import html from './setView.html';
import { registerAction, executeAction } from '../../services/actionRegistry.js';
import { loadJson } from '../../services/fsHelpers.js';
import appConfig from '../../appConfig';
import { buildCard } from '../../services/cardBuilder.js';
import { selectRow } from '../listView/rowSelectionService.js';

Alpine.data('setView', () => ({
    rows: [],
    columns: [],
    recentSets: appConfig.recentFiles,

    async init() {
        this.$root.innerHTML = html;
        this.columns = Alpine.store('game').columns;
        this.rows = Alpine.store('views').activeSet.cards;
        this.addRowLabel = 'Click to add a card or press Ctrl+Enter';

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

    async setActiveCard(selectedCard) {
        const views = Alpine.store('views');
        const card = selectedCard ? await buildCard(selectedCard.model) : {};
        views.activeCard = Alpine.reactive(card);
    },

    async selectCard(selectedCard) {
        const views = Alpine.store('views');
        views.selectedCard = selectedCard || {};
        await this.setActiveCard(selectedCard);
    },

    bindEvents() {
        this.$root.addEventListener('row-selected', (event) => {
            event.stopPropagation();
            const { row } = event.detail;
            console.log('%cSelected card:', 'color:orange', row.data.name);
            this.selectCard(row.original);
        });

        this.$root.addEventListener('add-row-click', () => this.addCard());
        registerAction('new-set', () => this.newSet());
        registerAction('add-card', () => this.addCard());
        registerAction('open-set', () => this.openSet());
        registerAction('delete-selected-cards', () => this.deleteSelectedCards());
        registerAction('copy', () => this.copyCard());
        registerAction('paste', () => this.pasteCard());
        registerAction('cut', () => {
            this.copyCard();
            this.deleteSelectedCards();
        });
    },

    newSet() {
        const views = Alpine.store('views');
        views.setFilePath = null;
        views.activeSet = Alpine.store('game').newSet();
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
            Alpine.nextTick(() => {
                executeAction('set-listview-selection', [index - 1]);
                this.selectCard(activeSet.cards[index - 1]);
            });
        });
    },

    addCard() {
        const game = Alpine.store('game');
        const { activeSet } = Alpine.store('views');
        const card = game.newCard();
        const indexToSelect = activeSet.cards.push(card) - 1;
        Alpine.nextTick(() => {
            executeAction('set-listview-selection', [indexToSelect]);
            this.selectCard(card);
        });
    },

    async openSet(filePath = null) {
        filePath = filePath || await openSingleFileDialog();
        if (!filePath) return;
        console.info('%cOpening set:', 'color:gold', filePath);
        const views = Alpine.store('views');
        views.setFilePath = filePath;
        views.activeSet = await loadJson(filePath);
        appConfig.addRecentFile(filePath);
    },

    copyCard() {
        const cards = [];
        executeAction('get-listview-selection').forEach(r => {
            cards.push(r.original);
        });

        navigator.clipboard.writeText(JSON.stringify({ cards }));
    },

    async pasteCard() {
        try {
            const clipboardText = await navigator.clipboard.readText();
            const clipboard = JSON.parse(clipboardText) || [];
            if (!clipboard?.cards?.length) return;
            const { activeSet } = Alpine.store('views');

            let indexToSelect = -1;
            clipboard.cards.forEach(card => {
                indexToSelect = activeSet.cards.push(card) - 1;
            });
            if (indexToSelect === -1) return;
            Alpine.nextTick(() => {
                executeAction('set-listview-selection', [indexToSelect]);
                this.selectCard(activeSet.cards[indexToSelect]);
            });
        } catch (e) {
            console.debug('%cPaste failed', 'color:red', e.message);
        }
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

