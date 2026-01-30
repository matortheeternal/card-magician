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
import JSONSerializer from '../../../domain/sets/serializers/JSONSerializer.js';

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
            openAdvancedSearch: () => log('user').info('Open advanced search.'),
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
        toggleDisplay(hasCards, this.statusBar, this.noContentPrompt);
        if (this.searchValue) this.updateSearch();
        this.updateStatus();
    }

    deleteSelectedCards() {
        log('user').info('delete selected cards');
        const activeSet = getActiveSet();
        this.listView.selection.forEach(r => {
            const index = activeSet.cards.indexOf(r.original);
            if (index === -1) {
                log('state').warn(`Couldn't find card:`, r.original);
                return;
            }
            activeSet.cards.splice(index, 1);
            changed(activeSet, 'cards');
            this.listView.selection = [index - 1];
            selectCard(activeSet.cards[index - 1]);
        });
    }

    async addCard() {
        log('user').info('Add card');
        const game = getActiveGame();
        const activeSet = getActiveSet();
        const card = game.newCard();
        activeSet.cards.push(card);
        changed(activeSet, 'cards');
        const indexToSelect = this.listView.activeRows.findIndex(row => {
            return row.original === card;
        });
        this.listView.selection = [indexToSelect];
        await selectCard(card);
        this.updateStatus();
    }

    async copyCard() {
        log('user').info('copy card');
        const cards = [];
        this.listView.selection.forEach(r => {
            cards.push(r.original);
        });

        const serializer = new JSONSerializer();
        const text = await serializer.serialize({ cards });
        await navigator.clipboard.writeText(text);
    }

    async pasteCard() {
        try {
            log('user').info('paste card');
            const clipboardText = await navigator.clipboard.readText();
            const serializer = new JSONSerializer();
            const clipboard = await serializer.deserialize(clipboardText) || [];
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
            log('user').debug('Paste failed', e);
        }
    }

    toggleSearch() {
        show(this.searchBar);
        const input = this.searchBar.querySelector('sl-input');
        input.focus();
    }

    updateSearch(event) {
        if (event) this.searchValue = event.target.value;
        log('user').info('Searching for:', this.searchValue);
        const cards = getActiveSet().cards;
        const game = getActiveGame();
        try {
            this.listView.rows = this.searchValue
                ? game.filter(cards, this.searchValue)
                : cards;
            this.updateStatus();
        } catch (e) {
            log('user').debug('Search error:', e);
        }
    }

    updateStatus() {
        log('render').debug('update set status');
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
        log('user').info('Selected card:', row.data.name);
        selectCard(row.original);
        this.updateStatus();
    }
}

customElements.define('cm-set-view', SetView);
