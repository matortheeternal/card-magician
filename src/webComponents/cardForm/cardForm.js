import Alpine from 'alpinejs';
import html from './cardForm.html';

class CardForm extends HTMLElement {
    constructor() {
        super();
        this.save = Alpine.debounce(this.save, 300);
    }

    connectedCallback() {
        this.render();
        this.addEventListener('save-face', this.save);
    }

    render() {
        this.innerHTML = this._card?.model ? html : '';
        this.bind();
    }

    bind() {
        this.faceForms.forEach(faceForm => {
            const faceId = faceForm.dataset.faceId;
            const key = faceForm.dataset.type || 'model';
            faceForm.face = this._card[key]?.[faceId];
        });
    }

    get faceForms() {
        return this.querySelectorAll('cm-face-form');
    }

    set card(value) {
        this._card = value;
        this.render();
    }

    get card() { return this._card; }

    async save() {
        const { activeCard, selectedCard } = Alpine.store('views');
        for (const face of Object.values(activeCard.model))
            selectedCard.model[face.id] = await face.save();
    }
}

customElements.define('cm-card-form', CardForm);
