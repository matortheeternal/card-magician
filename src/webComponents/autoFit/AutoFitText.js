import AutoFit from './AutoFit.js';

class AutoFitText extends AutoFit {
    constructor() {
        super();
        this.maxFont = 18.5;
    }

    checkFit(size) {
        this.style.fontSize = `${size}px`;
        const fitsWidth = this.scrollWidth <= this.clientWidth;
        const fitsHeight = this.scrollHeight <= this.clientHeight;
        return fitsWidth && fitsHeight;
    }
}

customElements.define('auto-fit-text', AutoFitText);
