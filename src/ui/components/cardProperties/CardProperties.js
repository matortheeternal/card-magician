import { getActiveGame } from '../../../domain/game/gameManager.js';
import { getSelectedCard } from '../../../domain/sets/setManager.js';

function buildHTML(card) {
    if (!card) return '';
    return (
        `<form-field field-id="tags"></form-field>
        <form-field field-id="notes"></form-field>`
    );
}

class CardProperties extends HTMLElement {
    #card;

    connectedCallback() {
        this.setAttribute('data-form-provider', '');
        this.render();
        this.bind();
    }

    bind() {
        this.addEventListener('cm-field-changed', this.save);
    }

    set card(card) {
        this.#card = card;
        if (this.isConnected) this.render();
    }

    get card() { return this.#card; }
    get model() { return this.#card; }

    get fields() {
        const game = getActiveGame();
        return game.baseCardFields;
    }

    render() {
        this.innerHTML = buildHTML(this.#card);
    }

    save() {
        const selectedCard = getSelectedCard();
        selectedCard.dirty = true;
        selectedCard.notes = this.#card.notes;
        selectedCard.tags = this.#card.tags;
    }
}

customElements.define('cm-card-properties', CardProperties);
