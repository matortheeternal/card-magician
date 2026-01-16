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

export default class SetView extends ReactiveComponent {
    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        onActiveSetChanged(set => {
            this.updateCards(set);
            this.watch('cards', set, 'cards', () => {
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
        this.addEventListener('sort-updated', () => this.updateStatus());

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

    get statusBar() {
        return this.querySelector('.status-bar');
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
        this.updateStatus();
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

    async addCard() {
        const game = getActiveGame();
        const activeSet = getActiveSet();
        const card = game.newCard();
        const indexToSelect = activeSet.cards.push(card) - 1;
        changed(activeSet, 'cards');
        this.listView.selection = [indexToSelect];
        selectCard(card);
        this.updateStatus();
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
        const game = getActiveGame();
        try {
            console.debug('%cSearching for:', 'color:orange', this.searchValue);
            this.listView.rows = this.searchValue
                ? game.filter(cards, this.searchValue)
                : cards;
            this.updateStatus();
        } catch (e) {
            console.debug('%cSearch error:', 'color:grey', e.message);
        }
    }

    updateStatus() {
        const activeSet = getActiveSet();
        const totalCount = activeSet.cards.length;
        const visibleCount = this.listView.rows.length;
        const filterStr = this.searchValue
            ? `Showing ${visibleCount} / `
            : '';
        const totalCardsStr = `${totalCount} cards`;
        const sortCols = this.listView.activeColumns
            .filter(col => Boolean(col.sort))
            .sort((a, b) => a.sort.priority - b.sort.priority)
            .map(col => `${col.label} ${col.sort.direction === 'asc' ? '↑' : '↓'}`);
        const sortStr = sortCols.length
            ? `, sorted by ${sortCols.join(', ')}`
            : '';
        const primaryStatus = [filterStr, totalCardsStr, sortStr].join('');
        const secondaryStatus = this.listView.selection.length
            ? `${this.listView.selection.length} selected`
            : '';
        this.statusBar.innerHTML = (
            `<div>${primaryStatus}</div>
             <div>${secondaryStatus}</div>`
        );
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
        this.updateStatus();
    }
}

customElements.define('cm-set-view', SetView);
