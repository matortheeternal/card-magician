import html from './cardFormHTML.js';

class CardForm extends HTMLElement {
    #card;

    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
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
}

customElements.define('cm-card-form', CardForm);
