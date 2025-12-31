import { esc } from '../../../shared/htmlUtils.js';
import Alpine from 'alpinejs';
import { getTags } from '../../../domain/game/tagManager.js';
import { getSelectedCard } from '../../../domain/sets/setManager.js';

const L = localize('card-properties');

function buildHTML(card) {
    if (!card) return '';
    const tags = getTags();
    return (
        `<sl-select
          size="small"
          label="${L`Tags`}"
          name="tags"
          value="${esc(card.tags.join(' '))}"
          placeholder="${L`Click to add tags`}"
          maxOptionsVisible="5"
          clearable
          multiple
          hoist
        >
        ${tags.map(tag => (
            `<sl-option value="${esc(tag.id)}">${tag.name}</sl-option>`
        )).join('\n')}
        </sl-select>
        <sl-textarea
          size="small"
          resize="auto"
          autocomplete="off"
          label="${L`Notes`}"
          name="notes"
          value="${esc(card.notes)}"
          rows="3"
        ></sl-textarea>`
    );
}

class CardProperties extends HTMLElement {
    #card;

    connectedCallback() {
        this.render();
        this.bind();
    }

    bind(){
        this.addEventListener('sl-input', this.onInput);
        this.addEventListener('sl-change', this.onChange);
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
        const selectedCard = getSelectedCard();
        selectedCard.notes = this.#card.notes;
        return true;
    }

    onInput(e) {
        return this.updateNotes(e);
    }

    updateTags(e) {
        if (e.target.name !== 'tags') return;
        this.#card.tags = e.target.value;
        const selectedCard = getSelectedCard();
        selectedCard.tags = this.#card.tags;
        return true;
    }

    onChange(e) {
        return this.updateTags(e);
    }
}

customElements.define('cm-card-properties', CardProperties);
