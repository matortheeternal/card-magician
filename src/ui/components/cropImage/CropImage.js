import { getImageSize } from '../../../shared/imageUtils.js';

const numericAttributes = {
    'crop-width': '_cropWidth',
    'crop-height': '_cropHeight',
    'offset-x': '_offsetX',
    'offset-y': '_offsetY'
};

class CropImage extends HTMLElement {
    _updatePromise = Promise.resolve(true);
    _loadedSrc = null;
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
        if (name === 'src') {
            this._src = newVal;
            this.requestUpdate();
            return;
        }
        this[numericAttributes[name]] = parseFloat(newVal)
            || (name.startsWith('crop-') ? 1 : 0);
        this.requestUpdate();
    }

    /** Resolves to true once queued rendering and image-size reads finish. */
    get updateComplete() {
        return this.waitForUpdate();
    }

    async waitForUpdate() {
        let update;
        do {
            update = this._updatePromise;
            await update;
        } while (update !== this._updatePromise);
        return true;
    }

    requestUpdate() {
        if (this._pending) return;
        this._pending = true;
        this._updatePromise = this._updatePromise.catch(() => {}).then(async () => {
            this._pending = false;
            await this.update();
            return true;
        });
        // Consumers observe failures through updateComplete, including in tests.
        this._updatePromise.catch(() => {});
    }

    async update() {
        if (this._src !== this._loadedSrc) {
            this._srcWidth = 0;
            this._srcHeight = 0;
            this.style.backgroundImage = '';
            const source = this._src;
            if (source) {
                const { width, height } = await getImageSize(source);
                this._srcWidth = width;
                this._srcHeight = height;
            }
            this._loadedSrc = source;
        }
        if (!this._srcWidth || !this._srcHeight || window.__EXPORTING__) return;
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
