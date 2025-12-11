import Alpine from 'alpinejs';
import html from './setView.html';
import { registerAction, executeAction } from '../../systems/actionSystem.js';
import { buildCard } from '../../../domain/card/cardBuilder.js';
import { loadSetData } from '../../../domain/sets/setManager.js';
import { filter } from '../../../domain/game/search.js';

Alpine.data('setView', () => ({
    rows: [],
    columns: [],
    recentSets: [],
    showSearch: false,
    searchValue: '',
    addRowLabel: 'Click to add a card or press Ctrl+Enter',

    async init() {
        this.$root.innerHTML = html;
        this.recentSets = Alpine.store('appConfig').recentFiles || [];
        this.columns = Alpine.store('game').columns;
        this.rows = Alpine.store('views').activeSet.cards.slice();
        this.changeTemplate = this.changeTemplate.bind(this);
        this.addFace = this.addFace.bind(this);

        this.$watch('$store.views.activeSet', (set) => {
            const cards = set.cards || [];
            this.rows.splice(0, this.rows.length, ...cards);
        });

        this.$watch('$store.appConfig.recentFiles', (recentFiles) => {
            this.recentSets = (recentFiles || []).slice(0, 4);
        });

        this.bindEvents();
        Alpine.initTree(this.$root);
    },

    async addFace(faceId) {
        const views = Alpine.store('views');
        views.selectedCard[faceId] = {};
        const card = await buildCard(views.selectedCard);
        views.activeCard = Alpine.reactive(card);
    },

    async changeTemplate(faceId, newTemplateId) {
        const views = Alpine.store('views');
        views.selectedCard[faceId].template = newTemplateId;
        const card = await buildCard(views.selectedCard);
        views.activeCard = Alpine.reactive(card);
    },

    async setActiveCard(selectedCard) {
        const views = Alpine.store('views');
        const card = selectedCard ? await buildCard(selectedCard) : null;
        views.activeCard = card && Alpine.reactive(card);
        views.selectedCard = selectedCard || {};
    },

    async selectCard(selectedCard) {
        await this.setActiveCard(selectedCard);
    },

    bindEvents() {
        this.$root.addEventListener('row-selected', (event) => {
            event.stopPropagation();
            const { row } = event.detail;
            console.log('%cSelected card:', 'color:orange', row.data.name);
            this.selectCard(row.original);
        });

        this.$root.addEventListener('sl-input', (e) => this.search(e));
        this.$root.addEventListener('add-row-click', () => this.addCard());
        registerAction('toggle-search', () => this.toggleSearch())
        registerAction('new-set', () => this.newSet());
        registerAction('add-card', () => this.addCard());
        registerAction('open-set', () => this.openSet());
        registerAction('delete-selected-cards', () => this.deleteSelectedCards());
        registerAction('copy', () => this.copyCard());
        registerAction('add-face', this.addFace);
        registerAction('paste', () => this.pasteCard());
        registerAction('change-template', this.changeTemplate);
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
        const game = Alpine.store('game');
        const views = Alpine.store('views');
        views.setFilePath = filePath;
        const set = await loadSetData(filePath);
        views.activeSet = game.loadSet(set);
        game.autoNumberCards(views.activeSet);
        Alpine.store('appConfig').addRecentFile(filePath);
    },

    copyCard() {
        const cards = [];
        executeAction('get-listview-selection').forEach(r => {
            cards.push(r.original);
        });

        navigator.clipboard.writeText(JSON.stringify({ cards }));
    },

    searchInputKeyDown(e) {
        if (e.key !== 'Escape') return;
        e.preventDefault();
        this.showSearch = false;
        this.searchValue = '';
        this.updateSearch();
    },

    toggleSearch() {
        this.showSearch = true;
        Alpine.nextTick(() => {
            const input = this.$root.querySelector('sl-input');
            input.focus();
        });
    },

    updateSearch() {
        const cards = Alpine.store('views').activeSet.cards
        try {
            console.debug('%cSearching for:', 'color:orange', this.searchValue);
            const results = this.searchValue ? filter(cards, this.searchValue) : cards;
            this.rows.splice(0, this.rows.length, ...results);
        } catch (e) {
            console.debug('%cSearch error:', 'color:grey', e.message);
        }
    },

    search(e) {
        this.searchValue = e.target.value;
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.updateSearch();
        }, 200);
    },

    openAdvancedSearch() {
        console.log('Open advanced search.');
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

