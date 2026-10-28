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
import ImageFieldValue from '../../../domain/card/ImageFieldValue.js';
import {
    readCardsFromClipboard,
    writeCardsToClipboard
} from '../../../domain/card/cardClipboard.js';
import { cardsToBlob } from '../../../domain/export/cardImageExporter.js';
import { updateBaseName } from '../../../domain/projects/cardNamer.js';
import { checkFileExists } from '../../../shared/fsUtils.js';
import { openModal } from '../../modals/modalManager.js';

const report = createReporter({ unit: 'SetView', label: 'Set List View' });

export default class SetView extends ReactiveComponent {
    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        onActiveProjectChanged(project => {
            this.updateCards(project);
            this.watch('cards', project, 'cards', () => {
                this.updateCards(project);
            });
        });

        getConfig().onRecentFilesChanged(() => this.renderRecentProjects());

        this.handleEvents('click', {
            buildFilter: () => openModal('cm-build-filter-modal'),
            addCard: () => this.addCard(),
            openProject: () => openProject()
        });
        this.handleEvents('keydown', {
            filterInputKeyDown: this.filterInputKeyDown
        });
        this.addEventListener('row-selected', event => this.onRowSelected(event));
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
        registerAction('delete-selected-cards', () => this.deleteSelectedCards());
        registerAction('copy', () => this.copyCard());
        registerAction('paste', () => this.pasteCard());
        registerAction('duplicate-selected-cards', () => this.duplicateCards());
    }

    get filterBar() {
        return this.querySelector('.filter-bar');
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

    get recentProjectsContainer() {
        return this.querySelector('.recent-projects-container');
    }

    renderRecentProject(container, project) {
        const button = document.createElement('sl-button');
        button.variant = 'text';
        button.size = 'small';
        button.classList.add('recent-project');
        button.addEventListener('click', () => openProject(project));
        button.textContent = String(project);
        container.appendChild(button);
    }

    async getRecentProjects() {
        const projects = [];
        for (const project of getConfig().recentFiles) {
            if (await checkFileExists(project))
                projects.push(project);
        }
        return projects;
    }

    async renderRecentProjects() {
        const recentProjects = await this.getRecentProjects();
        toggleDisplay(recentProjects.length > 0, this.recentProjectsContainer);
        if (!recentProjects.length) return;

        const container = this.recentProjectsContainer
            .querySelector('.buttons-container');
        container.innerHTML = '';
        for (const project of recentProjects)
            this.renderRecentProject(container, project);
    }

    render() {
        this.innerHTML = html;
        this.listView.columns = activeGame.columns;
        this.renderRecentProjects();
    }

    updateCards(project) {
        this.listView.rows = project.cards || [];
        const hasCards = Boolean(project.cards?.length);
        toggleDisplay(hasCards, this.listView, this.noContentPrompt);
        toggleDisplay(hasCards, this.statusBar, this.noContentPrompt);
        if (this.filterValue) this.updateFilter();
        this.updateStatus();
    }

    async deleteSelectedCards() {
        log('user').info('delete selected cards');
        for (const r of this.listView.selection) {
            const index = activeProject.cards.indexOf(r.original);
            if (index === -1) {
                log('state').warn(`Couldn't find card:`, r.original);
                return;
            }
            await r.original.deleteFiles();
            activeProject.cards.splice(index, 1);
            changed(activeProject, 'cards');
            this.listView.selection = [index - 1];
            selectCard(activeProject.cards[index - 1]);
        }
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
        try {
            const cards = this.listView.selection.map(row => row.original);
            if (!cards.length) return;
            const ready = this.flushPendingEdits().then(() => {
                for (const card of cards)
                    updateBaseName(card);
            });

            const imageBlob = ready.then(() => cardsToBlob(cards));
            await writeCardsToClipboard(cards, imageBlob, ready);
        } catch (error) {
            report('copyCard', error, [this.listView.selection]);
            log('user').error('Copy failed', error);
        }
    }

    async pasteCard() {
        try {
            log('user').info('paste card');
            const cards = await readCardsFromClipboard();
            if (!cards.length) return;

            for (const card of cards) {
                updateBaseName(card);
                await card.save(true);
                activeProject.cards.push(card);
            }
            changed(activeProject, 'cards');
            const lastCard = activeProject.cards.slice(-1)[0];
            const index = this.listView.activeRows.findIndex(row => {
                return row.original === lastCard;
            });
            if (index === -1) return;
            this.listView.selection = [index];
            await selectCard(lastCard);
        } catch (error) {
            report('pasteCard', error, [this.listView.selection]);
            log('user').error('Paste failed', error);
        }
    }

    async duplicateCard(sourceCard) {
        const serializer = new JSONSerializer();
        const data = await serializer.deserialize(
            await serializer.serialize(sourceCard)
        );
        const card = new activeGame.Card(data);
        const sourceImages = new Map(sourceCard.files.fields);
        for (const [key, image] of card.files.fields) {
            const sourceImage = sourceImages.get(key);
            if (!(image instanceof ImageFieldValue)
                || !(sourceImage instanceof ImageFieldValue)) continue;
            Object.assign(image, sourceImage.clone());
            image.dirty = Boolean(image.imageUrl);
        }

        updateBaseName(card);
        await card.save(true);
        activeProject.cards.push(card);
        return card;
    }

    async duplicateCards() {
        try {
            await this.flushPendingEdits();
            const sourceCards = this.listView.selection.map(row => row.original);
            const cards = [];

            for (const sourceCard of sourceCards) {
                const card = await this.duplicateCard(sourceCard);
                cards.push(card);
            }

            if (!cards.length) return;
            changed(activeProject, 'cards');
            const lastCard = cards.at(-1);
            const index = this.listView.activeRows.findIndex(row => {
                return row.original === lastCard;
            });
            if (index === -1) return;
            this.listView.selection = [index];
            await selectCard(lastCard);
        } catch (error) {
            report('duplicateCard', error, [this.listView.selection]);
            log('user').error('Duplicate failed', error);
        }
    }

    async flushPendingEdits() {
        await document.querySelector('cm-card-form')?.save.flush();
        await document.querySelector('cm-card-properties')?.save.flush();
    }

    showFilter() {
        show(this.filterBar);
        const input = this.filterBar.querySelector('sl-input');
        setTimeout(() => input.focus());
    }

    updateFilter(event) {
        if (event) this.filterValue = event.target.value;
        log('user').info('Filtering with:', this.filterValue);
        const cards = activeProject.cards;
        try {
            this.listView.rows = this.filterValue
                ? activeGame.filter(cards, this.filterValue)
                : cards;
            this.updateStatus();
        } catch (error) {
            log('user').debug('Filter error:', error);
        }
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
            card.front.artImage = await ImageFieldValue.fromFile(file);
            activeProject.cards.push(card);
        }
        changed(activeProject, 'cards');
        const indexToSelect = activeProject.cards.length - 1;
        this.listView.selection = [indexToSelect];
        await selectCard(activeProject.cards[indexToSelect]);
    }
}

customElements.define('cm-set-view', SetView);
