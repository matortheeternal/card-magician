import { registerPendingSave } from '../../../lifecycle.js';
import { registerAction } from '../../systems/actionSystem.js';

const SMOKE_TESTING = NL_ARGS.includes('--run-smoke-tests');
const DEBOUNCE_TIME = SMOKE_TESTING ? 30 : 500;

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
        this.addEventListener('cm-field-changed', () => {
            this.save();
        });
        registerAction('cancel-card-properties-save', () => this.save.cancel());
    }

    set card(card) {
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

    async save() {
        selectedProjectCard.notes = this.#card.notes;
        selectedProjectCard.tags = this.#card.tags;
        await selectedProjectCard.save();
    }
}

customElements.define('cm-card-properties', CardProperties);
