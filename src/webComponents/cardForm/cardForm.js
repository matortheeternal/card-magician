import Alpine from 'alpinejs';
import html from './cardForm.html';
import { buildCardFace } from '../../services/cardBuilder.js';

class CardForm extends HTMLElement {
    constructor() {
        super();
        this.save = Alpine.debounce(this.save, 300);
        this.handleOnClick = this.handleOnClick.bind(this);
    }

    connectedCallback() {
        this.render();
        this.addEventListener('save-card', this.save);
        this.addEventListener('click', this.handleOnClick);
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

    async handleOnClick(event) {
        const btn = event.target.closest('sl-button');
        if (!btn || !btn.classList.contains('add-face-btn')) return;
        const faceForm = btn.closest('cm-face-form, cm-options-form');
        const faceId = faceForm?.dataset?.faceId;
        this._card[faceId] = {};
        this._card[faceId] = await buildCardFace(this._card, faceId);
        this.bind();
    }

    async save() {
        const { activeCard, selectedCard } = Alpine.store('views');
        for (const face of Object.values(activeCard))
            selectedCard[face.id] = await face.save();
    }
}

customElements.define('cm-card-form', CardForm);
