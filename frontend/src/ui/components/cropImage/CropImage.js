import { getImageSize } from '../../../shared/imageUtils.js';

class CropImage extends HTMLElement {
    _src = null;
    _srcWidth = 0;
    _srcHeight = 0;
    _cropWidth = 1;
    _cropHeight = 1;
    _offsetX = 0;
    _offsetY = 0;

    static get observedAttributes() {
        return ['src', 'crop-width', 'crop-height', 'offset-x', 'offset-y'];
    }

    constructor() {
        super();
        this.requestUpdate = this.requestUpdate.bind(this);
        this._ro = new ResizeObserver(this.requestUpdate);
    }

    connectedCallback() {
        this.style.backgroundRepeat = 'no-repeat';
        this.style.backgroundPosition = '0px 0px';

        this._ro.observe(this);
        this.addEventListener('dom-morphed', this.requestUpdate);
        this.requestUpdate();
    }

    disconnectedCallback() {
        this.removeEventListener('dom-morphed', this.requestUpdate);
        this._ro.disconnect();
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (oldVal === newVal) return;
        switch (name) {
        case 'src':
            this._src = newVal;
            getImageSize(this._src).then(({width, height}) => {
                this._srcWidth = width;
                this._srcHeight = height;
                this.requestUpdate();
            });
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

        this.requestUpdate();
    }

    requestUpdate() {
        if (this._pending) return;
        this._pending = true;
        queueMicrotask(() => {
            this._pending = false;
            this.update();
        });
    }

    update() {
        if (!this._src || window.__EXPORTING__) return;
        const viewportWidth  = this.clientWidth;
        const viewportHeight = this.clientHeight;

        if (!viewportWidth || !viewportHeight) return;

        const bgWidth  = viewportWidth  / this._cropWidth  * this._srcWidth;
        const bgHeight = viewportHeight / this._cropHeight * this._srcHeight;
        const bgOffsetX = -1 * (viewportWidth  / this._cropWidth  * this._offsetX);
        const bgOffsetY = -1 * (viewportHeight / this._cropHeight * this._offsetY);

        this.style.backgroundImage    = `url("${this._src}")`;
        this.style.backgroundSize     = `${bgWidth}px ${bgHeight}px`;
        this.style.backgroundPosition = `${bgOffsetX}px ${bgOffsetY}px`;
    }
}

customElements.define('crop-image', CropImage);
