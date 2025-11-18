import { binarySearch } from '../../utils.js';

export default class AutoFit extends HTMLElement {
    _frozen = false;
    _fitting = false;

    static get observedAttributes() {
        return ['min', 'max'];
    }

    constructor() {
        super();
        this.minFont = 8;
        this.freeze = this.freeze.bind(this);
        this.thaw = this.thaw.bind(this);
        this.resizeObserver = new ResizeObserver(() => {
            if (!this._fitting && !this._frozen)
                this.queueFit();
        });
    }

    connectedCallback() {
        document.addEventListener('freeze-resize', this.freeze);
        document.addEventListener('thaw-resize', this.thaw);
        this.resizeObserver.observe(this);
        this.queueFit();
    }

    disconnectedCallback() {
        document.removeEventListener('freeze-resize', this.freeze);
        document.removeEventListener('thaw-resize', this.thaw);
        this.resizeObserver.disconnect();
    }

    freeze() {
        this._frozen = true;
    }

    thaw() {
        this._frozen = false;
        this.queueFit();
    }

    attributeChangedCallback(name, _, value) {
        if (name === 'min') this.minFont = parseFloat(value) || this.minFont;
        if (name === 'max') this.maxFont = parseFloat(value) || this.maxFont;
        this.queueFit();
    }

    queueFit() {
        cancelAnimationFrame(this._raf);
        this._raf = requestAnimationFrame(() => this.fit());
    }

    checkFit() {
        throw new Error('Method not implemented');
    }

    fit() {
        if (this.checkFit(this.maxFont)) return;
        if (!this.checkFit(this.minFont)) return;
        this._fitting = true;

        const best = binarySearch(
            this.minFont,
            this.maxFont,
            this.checkFit.bind(this),
            6
        );
        this.style.fontSize = `${best}px`;
        this._fitting = false;
    }
}
