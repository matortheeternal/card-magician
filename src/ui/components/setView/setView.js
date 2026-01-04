import ReactiveComponent from '../ReactiveComponent.js';
import html from './setView.html.js';
import { getActiveGame, getConfig } from '../../../domain/game/gameManager.js';
import {
    getActiveSet,
    onActiveSetChanged, openSet,
    selectCard,
} from '../../../domain/sets/setManager.js';
import { registerAction } from '../../systems/actionSystem.js';
import { hide, show, toggleDisplay } from '../../../shared/htmlUtils.js';
import { filter } from '../../../domain/game/search.js';

export default class SetView extends ReactiveComponent {
    #cardsWatch = null;

    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        onActiveSetChanged(set => {
            this.updateCards(set);
            if (this.#cardsWatch) this.#cardsWatch.remove();
            this.#cardsWatch = this.watch('cards', set, 'cards', () => {
                this.updateCards(set);
            });
        });

        getConfig().onRecentFilesChanged(() => this.renderRecentSets());

        this.handleEvents('click', {
            openAdvancedSearch: () => console.log('Open advanced search.'),
            addCard: () => this.addCard(),
            openSet: () => openSet()
        });
        this.handleEvents('keydown', {
            searchInputKeyDown: this.searchInputKeyDown
        });
        this.addEventListener('row-selected', event => this.onRowSelected(event));
        this.addEventListener('sl-input', this.updateSearch.debounce(200));
        this.addEventListener('add-row-click', event => this.addCard(event));

        registerAction('toggle-search', () => this.toggleSearch());
        registerAction('add-card', () => this.addCard());
        registerAction('delete-selected-cards', () => this.deleteSelectedCards());
        registerAction('copy', () => this.copyCard());
        registerAction('paste', () => this.pasteCard());
        registerAction('cut', () => {
            this.copyCard();
            this.deleteSelectedCards();
        });
    }

    get searchBar() {
        return this.querySelector('.search-bar');
    }

    get listView() {
        return this.querySelector('cm-list-view');
    }

    get noContentPrompt() {
        return this.querySelector('.no-content-prompt');
    }

    get recentSetsContainer() {
        return this.querySelector('.recent-sets-container');
    }

    renderRecentSets() {
        const recentSets = getConfig().recentFiles;
        toggleDisplay(recentSets.length > 0, this.recentSetsContainer);
        if (!recentSets.length) return;

        const container = this.recentSetsContainer.querySelector('.buttons-container');
        container.innerHTML = '';
        recentSets.forEach(set => {
            const button = document.createElement('sl-button');
            button.variant = 'text';
            button.size = 'small';
            button.classList.add('recent-set');
            button.addEventListener('click', () => openSet(set));
            button.textContent = String(set);
            container.appendChild(button);
        });
    }

    render() {
        this.innerHTML = html;
        this.listView.columns = getActiveGame().columns;
        this.renderRecentSets();
    }

    updateCards(set) {
        this.listView.rows = set.cards || [];
        const hasCards = Boolean(set.cards?.length);
        toggleDisplay(hasCards, this.listView, this.noContentPrompt);
        if (this.searchValue) this.updateSearch();
    }

    deleteSelectedCards() {
        const activeSet = getActiveSet();
        this.listView.selection.forEach(r => {
            const index = activeSet.cards.indexOf(r.original);
            if (index === -1) {
                console.warn(`Couldn't find card:`, r.original);
                return;
            }
            activeSet.cards.splice(index, 1);
            changed(activeSet, 'cards');
            this.listView.selection = [index - 1];
            selectCard(activeSet.cards[index - 1]);
        });
    }

    addCard() {
        const game = getActiveGame();
        const activeSet = getActiveSet();
        const card = game.newCard();
        const indexToSelect = activeSet.cards.push(card) - 1;
        changed(activeSet, 'cards');
        this.listView.selection = [indexToSelect];
        selectCard(card);
    }

    copyCard() {
        const cards = [];
        this.listView.selection.forEach(r => {
            cards.push(r.original);
        });

        navigator.clipboard.writeText(JSON.stringify({ cards }));
    }

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
            changed(activeSet, 'cards');
            this.listView.selection = [indexToSelect];
            await selectCard(activeSet.cards[indexToSelect]);
        } catch (e) {
            console.debug('%cPaste failed', 'color:red', e.message);
        }
    }

    toggleSearch() {
        show(this.searchBar);
        const input = this.searchBar.querySelector('sl-input');
        input.focus();
    }

    updateSearch(event) {
        if (event) this.searchValue = event.target.value;
        const cards = getActiveSet().cards;
        try {
            console.debug('%cSearching for:', 'color:orange', this.searchValue);
            this.listView.rows = this.searchValue
                ? filter(cards, this.searchValue)
                : cards;
        } catch (e) {
            console.debug('%cSearch error:', 'color:grey', e.message);
        }
    }

    searchInputKeyDown(event) {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        this.searchValue = '';
        hide(this.searchBar);
        this.updateSearch();
    }

    onRowSelected(event) {
        event.stopPropagation();
        const { row } = event.detail;
        console.log('%cSelected card:', 'color:orange', row.data.name);
        selectCard(row.original);
    }
}

customElements.define('cm-set-view', SetView);
