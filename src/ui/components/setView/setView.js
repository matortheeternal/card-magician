import ReactiveComponent from '../ReactiveComponent.js';
import html from './setView.html.js';
import { getConfig } from '../../../domain/game/gameManager.js';
import {
    openProject,
    onActiveProjectChanged,
    selectCard,
} from '../../../domain/projects/projectManager.js';
import { registerAction } from '../../systems/actionSystem.js';
import { hide, show, toggleDisplay } from '../../../shared/htmlUtils.js';
import JSONSerializer from '../../../domain/projects/serializers/JSONSerializer.js';
import ImageFileValue from '../../../domain/card/ImageFieldValue.js';

export default class SetView extends ReactiveComponent {
    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        onActiveProjectChanged(set => {
            this.updateCards(set);
            this.watch('cards', set, 'cards', () => {
                this.updateCards(set);
            });
        });

        getConfig().onRecentFilesChanged(() => this.renderRecentSets());

        this.handleEvents('click', {
            openAdvancedSearch: () => log('user').info('Open advanced search.'),
            addCard: () => this.addCard(),
            openSet: () => openProject()
        });
        this.handleEvents('keydown', {
            searchInputKeyDown: this.searchInputKeyDown
        });
        this.addEventListener('row-selected', event => this.onRowSelected(event));
        this.addEventListener('sl-input', this.updateSearch.debounce(200));
        this.addEventListener('add-row-click', event => this.addCard(event));
        this.addEventListener('sort-updated', () => this.updateStatus());
        this.addEventListener('dragover', event => this.onDragOver(event));
        this.addEventListener('drop', event => this.onDrop(event));

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
        return this.querySelector('.recent-projects-container');
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
            button.addEventListener('click', () => openProject(set));
            button.textContent = String(set);
            container.appendChild(button);
        });
    }

    render() {
        this.innerHTML = html;
        this.listView.columns = activeGame.columns;
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
        this.listView.selection.forEach(r => {
            const index = activeProject.cards.indexOf(r.original);
            if (index === -1) {
                log('state').warn(`Couldn't find card:`, r.original);
                return;
            }
            r.original.deleteFiles();
            activeProject.cards.splice(index, 1);
            changed(activeProject, 'cards');
            this.listView.selection = [index - 1];
            selectCard(activeProject.cards[index - 1]);
        });
    }

    async addCard() {
        log('user').info('Add card');
        const card = new activeGame.Card();
        activeProject.cards.push(card);
        changed(activeProject, 'cards');
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

            let indexToSelect = -1;
            clipboard.cards.forEach(card => {
                indexToSelect = activeProject.cards.push(card) - 1;
            });
            if (indexToSelect === -1) return;
            changed(activeProject, 'cards');
            this.listView.selection = [indexToSelect];
            await selectCard(activeProject.cards[indexToSelect]);
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
        const cards = activeProject.cards;
        try {
            this.listView.rows = this.searchValue
                ? activeGame.filter(cards, this.searchValue)
                : cards;
            this.updateStatus();
        } catch (e) {
            log('user').debug('Search error:', e);
        }
    }

    updateStatus() {
        log('render').debug('update set status');
        const totalCount = activeProject.cards.length;
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

    canDrop(event) {
        return Array.from(event.dataTransfer.items)
            .some(item => item.kind === 'file' && item.type.startsWith('image'));
    }

    onDragOver(event) {
        event.dataTransfer.dropEffect = this.canDrop(event) ? 'move' : 'none';
        event.preventDefault();
        event.stopPropagation();
    }

    async onDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        const files = Array.from(event.dataTransfer.items).filter(item => {
            return item.kind === 'file' && item.type.startsWith('image');
        }).map(item => item.getAsFile());
        for (const file of files) {
            const card = new activeGame.Card();
            // TODO: This need to be cross-game compatible
            card.front.artImage = await ImageFileValue.fromFile(file);
            activeProject.cards.push(card);
        }
        changed(activeProject, 'cards');
        const indexToSelect = activeProject.cards.length - 1;
        this.listView.selection = [indexToSelect];
        await selectCard(activeProject.cards[indexToSelect]);
    }
}

customElements.define('cm-set-view', SetView);
