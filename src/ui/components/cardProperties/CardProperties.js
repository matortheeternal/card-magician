import { registerPendingSave } from '../../../lifecycle.js';
import { executeAction, registerAction } from '../../systems/actionSystem.js';

const SMOKE_TESTING = appEnvironment.args.includes('--run-smoke-tests');
const DEBOUNCE_TIME = SMOKE_TESTING ? 30 : 500;
const IMMEDIATE_FIELDS = new Set(['tags', 'dismissedTags']);
const report = createReporter({ unit: 'CardProperties', label: 'Card Properties' });

function buildHTML(card) {
    if (!card) return '';
    return (
        `<form-field field-id="tags"></form-field>
        <form-field field-id="notes"></form-field>`
    );
}

class CardProperties extends HTMLElement {
    #card;

    constructor() {
        super();
        this.save = this.save.debounce(DEBOUNCE_TIME);
    }

    connectedCallback() {
        this.unregisterExitSave = registerPendingSave(this.save);
        this.setAttribute('data-form-provider', '');
        this.render();
        this.bind();
    }

    disconnectedCallback() {
        this.unregisterExitSave?.();
    }

    bind() {
        this.addEventListener('cm-field-changed', event => {
            executeAction('set-status', 'changes');
            this.save(this.#card).catch(() => {});
            if (IMMEDIATE_FIELDS.has(event.detail.fieldId))
                this.save.flush().catch(() => {});
        });
        registerAction('cancel-card-properties-save', () => this.save.cancel());
    }

    async setCard(card) {
        if (this.save.pending) await this.save.flush();
        this.#card = card;
        if (this.isConnected) this.render();
    }

    get card() { return this.#card; }
    get model() { return this.#card; }

    get fields() {
        return activeGame.baseCardFields;
    }

    render() {
        this.innerHTML = buildHTML(this.#card);
    }

    async save(card) {
        try {
            executeAction('set-status', 'saving');
            await this.saveProperties(card);
            executeAction('set-status', 'saved');
        } catch (error) {
            executeAction('set-status', 'failed');
            report('save', error, [card.baseCard]);
            throw error;
        }
    }

    async saveProperties(card) {
        const projectCard = card.baseCard;
        projectCard.notes = card.notes;
        projectCard.tags = card.tags;
        for (const key of ['dismissedTags', 'inheritedTags', 'excludedInheritedTags'])
            if (Object.hasOwn(card, key)) projectCard[key] = card[key];
        await projectCard.save();
    }
}

customElements.define('cm-card-properties', CardProperties);
