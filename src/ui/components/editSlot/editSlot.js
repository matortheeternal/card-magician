import ReactiveComponent from '../ReactiveComponent.js';
import { emit } from '../../../shared/htmlUtils.js';
import editSlotFields from './editSlotFields.js';

const L = localize('edit-packs-modal');

export default class EditSlot extends ReactiveComponent {
    #slot = null;

    connectedCallback() {
        this.setAttribute('data-form-provider', '');
        this.render();
        this.renderPool();
        this.updateComputedWeights();
        this.bind();
    }

    bind() {
        this.handleEvents('click', {
            removeSlot: () => {
                emit(this, 'cm-remove-slot', this.slot);
                this.remove();
            },
            addPoolEntry: () => this.addPoolEntry()
        });
        this.addEventListener('cm-remove-pool-entry', event => {
            this.slot.pool.remove(event.detail);
            setTimeout(() => this.updateComputedWeights());
        });
        this.addEventListener('cm-field-changed', event => {
            const field = event.target.closest('form-field');
            if (field.fieldId === 'weight') this.updateComputedWeights();
        });
        this.addEventListener('cm-card-count-changed', () => {
            this.updateComputedWeights();
        });
    }

    set slot(value) { this.#slot = value; }
    get slot() { return this.#slot; }
    get model() { return this.#slot; }
    get fields() { return editSlotFields; }

    get poolContainer() {
        return this.querySelector('div.pool-container');
    }

    updateComputedWeights() {
        const poolEntries = Array.from(this.querySelectorAll('cm-pool-entry'));
        const totalWeightedCount = poolEntries.reduce((total, entry) => {
            return total + parseInt(entry.model.weight || '0') * entry.cardCount;
        }, 0);
        poolEntries.forEach(entry => entry.updateWeightPercent(totalWeightedCount));
    }

    renderPool() {
        for (const entry of this.model.pool) {
            const element = document.createElement('cm-pool-entry');
            element.entry = entry;
            this.poolContainer.appendChild(element);
        }
    }

    render() {
        this.innerHTML = (
            `<sl-tooltip content="${L`Remove Slot`}">
                <sl-icon name="x-lg" data-click-action="removeSlot"></sl-icon>
            </sl-tooltip>
            <form-group>
                <form-field field-id="label"></form-field>
                <form-field field-id="count"></form-field>
                <form-field field-id="collation"></form-field>
            </form-group>
            <section>
                <div class="pool-container">
                    <div class="header-row">
                        <div>${L`Filter Expression`}</div>
                        <div>${L`Weight`}</div>
                        <div></div>
                    </div>
                </div>
                <div class="add-pool-entry" data-click-action="addPoolEntry">
                    ${L`+ Add Pool Entry`}
                </div>
            </section>`
        );
    }

    addPoolEntry() {
        const element = document.createElement('cm-pool-entry');
        element.entry = { expression: '', weight: 1 };
        this.slot.pool.push(element.entry);
        this.poolContainer.appendChild(element);
        this.updateComputedWeights();
    }

    onChange() {
        emit(this, 'cm-slot-changed');
    }
}

customElements.define('cm-edit-slot', EditSlot);
