class CardFace extends HTMLElement {
    #face;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        if (this.#face) this.render();
    }

    set face(value) {
        this.#face = value;
        if (this.isConnected) this.render();
    }

    get face() {
        return this.#face;
    }

    render() {
        if (!this.#face?.dom) return;
        this.shadowRoot.innerHTML = '';
        this.classList.add(`face-${this.#face.id}`);
        this.shadowRoot.appendChild(this.#face.dom);
    }
}

customElements.define('cm-card-face', CardFace);
