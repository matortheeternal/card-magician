import { emit } from '../../utils.js';

export default class DisplayCardFace extends HTMLElement {
    #face;
    initialized = false;

    constructor() {
        super();
        this.onInit = this.onInit.bind(this);
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        if (this.#face) this.render();
        this.shadowRoot.addEventListener('RenderScheduler:flushed', this.onInit);
    }

    onInit() {
        this.initialized = true;
        this.shadowRoot.removeEventListener('RenderScheduler:flushed', this.onInit);
        console.debug(`%ccard-face:initialized(%s)`, 'color:gold', this.#face.id);
        emit(this, 'card-face:initialized');
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
        this.classList.add(this.#face.id);
        this.shadowRoot.appendChild(this.#face.dom.root);
    }
}

customElements.define('cm-card-face', DisplayCardFace);
