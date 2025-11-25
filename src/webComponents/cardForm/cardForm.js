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

    async handleOnClick(event) {
        const btn = event.target.closest('sl-button');
        if (!btn || !btn.classList.contains('add-face-btn')) return;
        const faceForm = btn.closest('cm-face-form');
        const faceId = faceForm?.dataset?.faceId;
        if (!faceId) return;
        this._card.style ||= {};
        this._card.style[faceId] = {};
        if (faceForm.dataset.type !== 'style') {
            const game = Alpine.store('game');
            const faceData = { template: game.defaultTemplateId };
            await buildCardFace(this._card.model, faceId, faceData);
        }
        this.bind();
    }

    async save() {
        const { activeCard, selectedCard } = Alpine.store('views');
        for (const face of Object.values(activeCard.model))
            selectedCard.model[face.id] = await face.save();
    }
}

customElements.define('cm-card-form', CardForm);
