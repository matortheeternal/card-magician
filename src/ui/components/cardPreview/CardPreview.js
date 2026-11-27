import { buildCard } from '../../../domain/card/cardBuilder.js';

export default class CardPreview extends HTMLElement {
    #data = null;

    set data(value) {
        this.#data = value;
        if (this.isConnected) this.render();
    }

    get data() {
        return this.#data;
    }

    connectedCallback() {
        if (this.#data) this.render();
    }

    async render() {
        const data = this.#data;
        const card = await buildCard(data);
        if (data !== this.#data) return;
        const preview = document.createElement('cm-card');
        preview.card = card;
        this.replaceChildren(preview);
    }
}

customElements.define('cm-card-preview', CardPreview);
