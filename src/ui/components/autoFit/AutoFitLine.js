import AutoFit from './AutoFit.js';

class AutoFitLine extends AutoFit {
    connectedCallback() {
        super.connectedCallback();
    }

    checkFit(size) {
        this.style.fontSize = `${Math.floor(size * 10) / 10}px`;
        return this.scrollWidth <= this.clientWidth;
    }

    fit() {
        this.style.whiteSpace = 'nowrap';
        super.fit();
    }
}

customElements.define('auto-fit-line', AutoFitLine);
