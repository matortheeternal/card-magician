import { esc } from '../../../shared/htmlUtils.js';
import Alpine from 'alpinejs';

function buildHTML(card) {
    if (!card) return '';
    return (
        `<sl-textarea
          size="small"
          resize="auto"
          autocomplete="off"
          label="Notes"
          name="notes"
          value="${esc(card.notes)}"
          rows="3"
        ></sl-textarea>`
    )
}

class CardProperties extends HTMLElement {
    #card;

    connectedCallback() {
        this.render();
        this.bind();
    }

    bind(){
        this.addEventListener('sl-input', this.onInput);
    }

    set card(card) {
        this.#card = card;
        if (this.isConnected) this.render();
    }

    get card() {
        return this.#card;
    }

    render() {
        this.innerHTML = buildHTML(this.#card);
    }

    updateNotes(e) {
        if (e.target.name !== 'notes') return;
        this.#card.notes = e.target.value;
        const { selectedCard } = Alpine.store('views');
        selectedCard.notes = this.#card.notes;
        return true;
    }

    onInput(e) {
        return this.updateNotes(e);
    }
}

customElements.define('cm-card-properties', CardProperties);
