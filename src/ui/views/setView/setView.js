import Alpine from 'alpinejs';
import html from './setView.html';
import { registerAction, executeAction } from '../../systems/actionSystem.js';
import {
    getActiveSet, getSetCards, mutateCard, newSet,
    openSet, selectCard, setActiveCard
} from '../../../domain/sets/setManager.js';
import { filter } from '../../../domain/game/search.js';
import { getActiveGame, getConfig } from '../../../domain/game/gameManager.js';

const L = localize('set-view');

Alpine.data('setView', () => ({
    rows: [],
    columns: [],
    recentSets: [],
    showSearch: false,
    searchValue: '',
    addCardLabel: L`Add a card`,
    openSetLabel: L`Open a set`,
    recentSetsLabel: L`Recent sets`,
    advancedSearchLabel: L`Advanced`,
    searchPlaceholder: L`Search for cards`,
    noCardsLabel: L`This set has no cards in it.`,
    addRowLabel: L`Click to add a card or press Ctrl+Enter`,

    async init() {
        this.$root.innerHTML = html;
        this.recentSets = getConfig().recentFiles || [];
        this.columns = getActiveGame().columns;
        this.rows = getSetCards();
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
        await mutateCard(card => {
            card[faceId] = {};
        });
    },

    async changeTemplate(faceId, newTemplateId) {
        await mutateCard(card => {
            card[faceId].template = newTemplateId;
        });
    },

    async selectCard(card) {
        await selectCard(card);
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
        registerAction('toggle-search', () => this.toggleSearch());
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
        newSet();
        setActiveCard(null);
    },

    deleteSelectedCards() {
        const activeSet = getActiveSet();
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
        const game = getActiveGame();
        const activeSet = getActiveSet();
        const card = game.newCard();
        const indexToSelect = activeSet.cards.push(card) - 1;
        Alpine.nextTick(() => {
            executeAction('set-listview-selection', [indexToSelect]);
            this.selectCard(card);
        });
    },

    async openSet(filePath = null) {
        openSet(filePath);
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
        const cards = getActiveSet().cards;
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
            const activeSet = getActiveSet();

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

