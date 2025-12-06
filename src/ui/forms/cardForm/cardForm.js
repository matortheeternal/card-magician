import Alpine from 'alpinejs';
import html from './cardForm.html';
import { buildCardFace } from '../../../domain/card/cardBuilder.js';

class CardForm extends HTMLElement {
    constructor() {
        super();
        this.save = Alpine.debounce(this.save, 300);
    }

    connectedCallback() {
        this.render();
        this.addEventListener('cm-field-changed', this.save);
    }

    render() {
        this.innerHTML = this._card ? html : '';
        this.bind();
    }

    bind() {
        this.faceForms.forEach(faceForm => {
            const faceId = faceForm.dataset.faceId;
            faceForm.face = this._card[faceId];
        });
    }

    get faceForms() {
        return this.querySelectorAll('cm-face-form, cm-options-form');
    }
    set card(value) {
        this._card = value;
        this.render();
    }

    get card() { return this._card; }

    async save() {
        const { activeCard, selectedCard } = Alpine.store('views');
        for (const face of Object.values(activeCard))
            selectedCard[face.id] = await face.save();
    }
}

customElements.define('cm-card-form', CardForm);
