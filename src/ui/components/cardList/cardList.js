import ReactiveComponent from '../ReactiveComponent.js';
import html from './cardList.html.js';
import {
    openProject,
    onActiveProjectChanged,
    selectCard,
} from '../../../domain/projects/projectManager.js';
import { registerAction } from '../../systems/actionSystem.js';
import { hide, show, toggleDisplay } from '../../../shared/htmlUtils.js';
import ImageFieldValue from '../../../domain/card/ImageFieldValue.js';
import { openModal } from '../../modals/modalManager.js';
import * as history from '../../systems/historySystem.js';
import { flushPendingCardSaves } from '../../systems/cardEditingSystem.js';
import { registerHotkey } from '../../systems/hotkeySystem.js';

const report = createReporter({ unit: 'CardList' });

export default class CardList extends ReactiveComponent {
    selectionUpdate = Promise.resolve();
    #selectionRequest;

    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        registerHotkey('ArrowUp', () => this.listView.moveSelection(-1));
        registerHotkey('ArrowDown', () => this.listView.moveSelection(1));
        this.addEventListener('row-selected', event => this.onRowSelected(event));
        onActiveProjectChanged(project => {
            this.updateCards(project);
            this.watch('cards', project, 'cards', () => {
                this.updateCards(project);
            });
        });

        this.handleEvents('click', {
            buildFilter: () => openModal('cm-build-filter-modal'),
            addCard: () => this.addCard(),
            openProject: () => openProject()
        });
        this.handleEvents('keydown', {
            filterInputKeyDown: this.filterInputKeyDown
        });
        this.addEventListener('sl-input', this.updateFilter.debounce(200));
        this.addEventListener('add-row-click', event => this.addCard(event));
        this.addEventListener('sort-updated', () => this.updateStatus());
        this.addEventListener('dragover', event => this.onDragOver(event));
        this.addEventListener('drop', event => this.onDrop(event));

        registerAction('filter', query => {
            const input = this.filterBar.querySelector('sl-input');
            input.value = query;
            this.filterValue = query;
            this.showFilter();
            this.updateFilter();
        });
        registerAction('toggle-filter', () => this.showFilter());
        registerAction('add-card', () => this.addCard());
        registerAction('reveal-card', card => this.revealCard(card));
        registerAction('create-cards', cards => this.createCards(cards));
        registerAction('delete-selected-cards', () => this.deleteSelectedCards());
    }

    get filterBar() {
        return this.querySelector('.filter-bar');
    }

    get filterInput() { return this.filterBar.querySelector('sl-input'); }

    get listView() {
        return this.querySelector('cm-list-view');
    }

    get statusBar() {
        return this.querySelector('.status-bar');
    }

    get noContentPrompt() {
        return this.querySelector('.no-content-prompt');
    }

    render() {
        this.innerHTML = html;
        this.listView.columns = activeGame.columns;
    }

    getVisibleCards(cards) {
        if (!this.filterValue) return cards;
        try {
            return activeGame.filter(cards, this.filterValue);
        } catch (error) {
            log('user').debug('Filter error:', error);
            return cards;
        }
    }

    updateCards(project) {
        this.listView.rows = this.getVisibleCards(project.cards || []);
        const hasCards = Boolean(project.cards?.length);
        toggleDisplay(hasCards, this.listView, this.noContentPrompt);
        toggleDisplay(hasCards, this.statusBar, this.noContentPrompt);
        this.updateStatus();
    }

    async revealCard(card) {
        if (!activeProject.cards.includes(card)) return;
        await this.flushSelection();
        if (!this.listView.rows.includes(card)) {
            this.filterValue = '';
            this.filterInput.value = '';
            this.updateFilter();
        }
        this.listView.revealRow(card);
        await this.flushSelection();
    }

    async deleteSelectedCards() {
        log('user').info('delete selected cards');
        const cards = this.listView.selection.map(row => row.original);
        if (!cards.length) return;
        const event = new CustomEvent('cm-cards-deleted', { detail: { cards } });
        return history.execute(activeProject, event);
    }

    createCards(cards) {
        if (!cards.length) return;
        const event = new CustomEvent('cm-cards-created', { detail: { cards } });
        return history.execute(activeProject, event);
    }

    async addCard() {
        log('user').info('Add card');
        await this.createCards([new activeGame.Card()]);
    }

    showFilter() {
        show(this.filterBar);
        const input = this.filterBar.querySelector('sl-input');
        setTimeout(() => input.focus());
    }

    updateFilter(event) {
        if (event) this.filterValue = event.target.value;
        log('user').info('Filtering with:', this.filterValue);
        this.updateCards(activeProject);
    }

    updateStatus() {
        log('render').debug('update project status');
        const totalCount = activeProject.cards.length;
        const visibleCount = this.listView.rows.length;
        const filterStr = this.filterValue
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

    filterInputKeyDown(event) {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        this.filterValue = '';
        hide(this.filterBar);
        this.updateFilter();
    }

    async flushSelection() {
        let update;
        do {
            update = this.selectionUpdate;
            await update;
        } while (update !== this.selectionUpdate);
    }

    onRowSelected(event) {
        event.stopPropagation();
        const { row } = event.detail;
        const card = row?.original || null;
        const request = {};
        this.#selectionRequest = request;
        this.selectionUpdate = this.selectionUpdate.catch(() => {})
            .then(() => this.applySelection(card, request));
        this.selectionUpdate.catch(error => report('selectCard', error, [card]));
    }

    async applySelection(card, request) {
        if (request !== this.#selectionRequest) return;
        await flushPendingCardSaves();
        if (request !== this.#selectionRequest) return;
        if (window.selectedProjectCard !== card) await selectCard(card);
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
        const cards = [];
        for (const file of files) {
            const card = new activeGame.Card();
            // TODO: This needs to be cross-game compatible.
            card.front.artImage = await ImageFieldValue.fromFile(file);
            cards.push(card);
        }
        await this.createCards(cards);
    }
}

customElements.define('cm-card-list', CardList);
