import { binarySearch } from '../../utils.js';

export default class AutoFit extends HTMLElement {
    static get observedAttributes() {
        return ['min', 'max'];
    }

    constructor() {
        super();
        this.minFont = 8;
        this.queueFit = this.queueFit.bind(this);
        this.resizeObserver = new ResizeObserver(this.queueFit);
    }

    connectedCallback() {
        this.addEventListener('dom-morphed', this.queueFit);
        this.resizeObserver.observe(this);
        document.fonts.ready.then(() => this.queueFit());
    }

    disconnectedCallback() {
        this.removeEventListener('dom-morphed', this.queueFit);
        this.resizeObserver.disconnect();
    }

    attributeChangedCallback(name, _, value) {
        if (name === 'min') this.minFont = parseFloat(value) || this.minFont;
        if (name === 'max') this.maxFont = parseFloat(value) || this.maxFont;
        this.queueFit();
    }

    queueFit() {
        if (this._pending) return;
        this._pending = true;
        queueMicrotask(() => {
            this._pending = false;
            this.fit();
        });
    }

    checkFit() {
        throw new Error('Method not implemented');
    }

    fit() {
        if (window.__EXPORTING__) return;
        const best = binarySearch(
            this.minFont,
            this.maxFont,
            this.checkFit.bind(this),
            6
        );
        this.style.fontSize = `${best}px`;
    }
}
