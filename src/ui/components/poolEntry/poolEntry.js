import ReactiveComponent from '../ReactiveComponent.js';
import { emit } from '../../../shared/htmlUtils.js';
import poolEntryFields from './poolEntryFields.js';
import { getActiveGame } from '../../../domain/game/gameManager.js';
import { getActiveSet } from '../../../domain/sets/setManager.js';

const L = localize('edit-packs-modal');

export default class PoolEntry extends ReactiveComponent {
    #entry = null;
    #cardCount = 0;

    connectedCallback() {
        this.setAttribute('data-form-provider', '');
        this.render();
        this.updateResultCount();
        this.bind();
    }

    bind() {
        this.handleEvents('click', {
            removeEntry: () => {
                emit(this, 'cm-remove-pool-entry', this.entry);
                this.remove();
            }
        });
        this.addEventListener('cm-field-changed', event => {
            const field = event.target.closest('form-field');
            if (field.fieldId === 'expression') this.updateResultCount();
        });
    }

    set entry(value) { this.#entry = value; }
    get entry() { return this.#entry; }
    get model() { return this.#entry; }
    get fields() { return poolEntryFields; }
    get cardCount() { return this.#cardCount; }

    getFilteredCount() {
        const cards = getActiveSet().cards;
        const game = getActiveGame();
        try {
            const results = game.filter(cards, this.model.expression);
            return results.length;
        } catch (e) {
            log('user').debug('Search error:', e);
            return 0;
        }
    }

    updateWeightPercent(totalPoolSize) {
        const weight = parseInt(this.model.weight || '0');
        const weightedCardCount = weight * this.cardCount;
        const computedRate = (weightedCardCount / totalPoolSize) || 0;
        const percent = (computedRate * 100).toFixed(1);
        const container = this.querySelector('.computed-weight');
        container.textContent = `(${percent}%)`;
    }

    updateResultCount() {
        const count = this.getFilteredCount();
        this.#cardCount = count;
        const container = this.querySelector('.result-count');
        container.textContent = count !== 1
            ? L`(${count} cards)`
            : L`(${count} card)`;
        container.classList.toggle('error', count === 0);
        emit(this, 'cm-card-count-changed');
    }

    render() {
        this.innerHTML = (
            `<div class="search-container">
                <form-field field-id="expression"></form-field>
                <div class="result-count"></div>
            </div>
            <div class="weight-container">
                <form-field field-id="weight"></form-field>
                <div class="computed-weight"></div>
            </div>
            <sl-tooltip content="${L`Remove`}">
                <sl-icon name="trash" data-click-action="removeEntry"></sl-icon>
            </sl-tooltip>`
        );
    }
}

customElements.define('cm-pool-entry', PoolEntry);
