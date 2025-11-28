import AutoFit from './AutoFit.js';

class AutoFitLine extends AutoFit {
    constructor() {
        super();
        this.maxFont = 20;
    }

    connectedCallback() {
        super.connectedCallback();
    }

    checkFit(size) {
        this.style.fontSize = `${size}px`;
        return this.scrollWidth <= this.clientWidth;
    }

    fit() {
        this.style.whiteSpace = 'nowrap';
        super.fit();
    }
}

customElements.define('auto-fit-line', AutoFitLine);
