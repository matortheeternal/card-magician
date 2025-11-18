import { binarySearch } from '../../utils.js';

export default class AutoFit extends HTMLElement {
    static get observedAttributes() {
        return ['min', 'max'];
    }

    constructor() {
        super();
        this.minFont = 8;
        this.resizeObserver = new ResizeObserver(() => this.queueFit());
    }

    connectedCallback() {
        this.resizeObserver.observe(this);
        this.queueFit();
    }

    disconnectedCallback() {
        this.resizeObserver.disconnect();
    }

    attributeChangedCallback(name, _, value) {
        if (name === 'min') this.minFont = parseFloat(value) || this.minFont;
        if (name === 'max') this.maxFont = parseFloat(value) || this.maxFont;
        this.queueFit();
    }

    queueFit() {
        cancelAnimationFrame(this._raf);
        this._raf = requestAnimationFrame(() => {
            this.resizeObserver.disconnect();
            this.fit();
            this.resizeObserver.observe(this);
        });
    }

    checkFit() {
        throw new Error('Method not implemented');
    }

    fit() {
        if (this.checkFit(this.maxFont)) return;
        if (!this.checkFit(this.minFont)) return;

        const best = binarySearch(
            this.minFont,
            this.maxFont,
            this.checkFit.bind(this),
            6
        );
        this.style.fontSize = `${best}px`;
    }
}
