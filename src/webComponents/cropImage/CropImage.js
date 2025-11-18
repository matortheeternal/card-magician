import { getImageSize } from '../../gfx/imageProcessing.js';

class CropImage extends HTMLElement {
    static get observedAttributes() {
        return ['src', 'crop-width', 'crop-height', 'offset-x', 'offset-y'];
    }

    constructor() {
        super();

        this._src = null;
        this._cropWidth = 1;
        this._cropHeight = 1;
        this._offsetX = 0;
        this._offsetY = 0;

        this._ro = new ResizeObserver(() => this.update());
    }

    connectedCallback() {
        this.style.backgroundRepeat = 'no-repeat';
        this.style.backgroundPosition = '0px 0px';

        this._ro.observe(this);
        this.update();
    }

    disconnectedCallback() {
        this._ro.disconnect();
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (oldVal === newVal) return;
        switch (name) {
            case 'src':
                this._src = newVal;
                break;
            case 'crop-width':
                this._cropWidth = parseFloat(newVal) || 1;
                break;
            case 'crop-height':
                this._cropHeight = parseFloat(newVal) || 1;
                break;
            case 'offset-x':
                this._offsetX = parseFloat(newVal) || 0;
                break;
            case 'offset-y':
                this._offsetY = parseFloat(newVal) || 0;
                break;
        }

        this.update();
    }

    async update() {
        if (!this._src) return;
        const viewportWidth  = this.clientWidth;
        const viewportHeight = this.clientHeight;

        if (!viewportWidth || !viewportHeight) return;

        const { width, height } = await getImageSize(this._src);
        const bgWidth  = viewportWidth  / this._cropWidth  * width;
        const bgHeight = viewportHeight / this._cropHeight * height;
        const bgOffsetX = -1 * (viewportWidth  / this._cropWidth  * this._offsetX);
        const bgOffsetY = -1 * (viewportHeight / this._cropHeight * this._offsetY);

        this.style.backgroundImage    = `url("${this._src}")`;
        this.style.backgroundSize     = `${bgWidth}px ${bgHeight}px`;
        this.style.backgroundPosition = `${bgOffsetX}px ${bgOffsetY}px`;
    }
}

customElements.define('crop-image', CropImage);
