import Alpine from 'alpinejs';
import html from './cardForm.html';

class CardForm extends HTMLElement {
    #card;

    constructor() {
        super();
        this.save = Alpine.debounce(this.save, 300);
    }

    connectedCallback() {
        this.render();
        this.addEventListener('cm-field-changed', this.save);
    }

    render() {
        this.innerHTML = this.#card ? html : '';
        this.bind();
    }

    bind() {
        this.faceForms.forEach(faceForm => {
            const faceId = faceForm.dataset.faceId;
            faceForm.face = this.#card[faceId];
        });
    }

    get faceForms() {
        return this.querySelectorAll('cm-face-form, cm-options-form');
    }
    set card(value) {
        this.#card = value;
        this.render();
    }

    get card() { return this.#card; }

    async save() {
        const { activeCard, selectedCard } = Alpine.store('views');
        selectedCard.front = await activeCard.front.save();
        if (activeCard.back)
            selectedCard.back = await activeCard.back.save();
    }
}

customElements.define('cm-card-form', CardForm);
