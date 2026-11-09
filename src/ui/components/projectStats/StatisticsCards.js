import ReactiveComponent from '../ReactiveComponent.js';

const L = localize('project-statistics');
const selectionLabelFormatters = {
    row: label => L`Row: ${label}`,
    column: label => L`Column: ${label}`,
    'row,column': label => L`Cell: ${label}`,
    '': label => label
};

function selectionGroupLabel(selection, label) {
    const axes = ['row', 'column'].filter(axis => selection[axis] !== undefined);
    return selectionLabelFormatters[axes.join(',')](label);
}

function cardCountLabel(count) {
    if (count === 1) return L`${count} card`;
    return L`${count} cards`;
}

export default class StatisticsCards extends ReactiveComponent {
    get header() { return this.querySelector('header'); }
    get emptyMessage() { return this.querySelector('.no-content-message'); }
    get source() { return this.querySelector('header strong'); }
    get group() { return this.querySelector('.stats-card-group'); }
    get summary() { return this.querySelector('[role="status"]'); }
    get list() { return this.querySelector('ul'); }
    get clearButton() { return this.querySelector('sl-icon-button'); }

    connectedCallback() {
        this.render();
        this.bind();
        this.clear();
    }

    render() {
        this.innerHTML = `
            <aside aria-label="${L`Selected cards`}">
                <header>
                    <div>
                        <strong></strong>
                        <p class="stats-card-group"></p>
                        <p role="status"></p>
                    </div>
                    <sl-tooltip content="${L`Clear Selection`}" hoist>
                        <sl-icon-button name="x-lg" label="${L`Clear Selection`}">
                        </sl-icon-button>
                    </sl-tooltip>
                </header>
                <p class="no-content-message" role="status">${L([
                    'Select a chart row, column, or cell to view its corresponding cards.'
                ])}</p>
                <ul aria-label="${L`Cards in selection`}"></ul>
            </aside>`;
    }

    bind() {
        this.on('click', event => {
            if (event.target !== this.clearButton) return;
            this.clear();
        });
    }

    showSelection({ cards, title, label, selection }) {
        this.source.textContent = title;
        this.group.textContent = selectionGroupLabel(selection, label);
        this.header.hidden = false;
        this.emptyMessage.hidden = true;
        this.summary.textContent = cardCountLabel(cards.length);
        this.clearButton.hidden = false;
        this.list.replaceChildren(...cards.map(card => this.createCardItem(card)));
    }

    createCardItem(card) {
        const item = document.createElement('li');
        item.textContent = card.name || L`Unnamed card`;
        item.tabIndex = 0;
        item.setAttribute('aria-label', L`Open card: ${item.textContent}`);
        const activate = () => this.emit('card-activated', { card });
        item.addEventListener('click', activate);
        item.addEventListener('keydown', event => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            activate();
        });
        return item;
    }

    clear() {
        this.source.textContent = '';
        this.group.textContent = '';
        this.summary.textContent = '';
        this.header.hidden = true;
        this.emptyMessage.hidden = false;
        this.list.replaceChildren();
        this.clearButton.hidden = true;
    }
}

customElements.define('cm-statistics-cards', StatisticsCards);
