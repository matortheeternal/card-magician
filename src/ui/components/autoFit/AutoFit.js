import { emit } from '../../../shared/htmlUtils.js';

const DEFAULT_MAX_FONT = 18;

export function binarySearch(min, max, check, maxIt, step = 0.1) {
    if (check(max)) return max;
    if (!check(min)) return min;
    const quantize = value => Math.round(value / step) * step;

    let low = min;
    let high = max;
    let best = low;

    for (let i = 0; i < maxIt; i++) {
        const mid = quantize((low + high) / 2);
        const fits = check(mid);

        if (fits) {
            best = mid;
            low = mid;
            continue;
        }
        high = mid;
    }

    return best;
}

export default class AutoFit extends HTMLElement {
    static get observedAttributes() {
        return ['min', 'max'];
    }

    constructor() {
        super();
        this.queueFit = this.queueFit.bind(this);
        this.resizeObserver = new ResizeObserver(() => {
            cancelAnimationFrame(this.resizeFrame);
            this.resizeFrame = requestAnimationFrame(this.queueFit);
        });
    }

    get defaultMinFont() { return 8; };

    get cssMaxFont() {
        this.style.removeProperty('font-size');
        return parseFloat(getComputedStyle(this).fontSize) || DEFAULT_MAX_FONT;
    }

    get maxFont() {
        return this.maxAttributeFont ?? this.cssMaxFont;
    }

    connectedCallback() {
        this.minFont ||= this.defaultMinFont;
        this.addEventListener('dom-morphed', this.queueFit);
        this.resizeObserver.observe(this);
        document.fonts.ready.then(() => this.queueFit());
    }

    disconnectedCallback() {
        this.removeEventListener('dom-morphed', this.queueFit);
        this.resizeObserver.disconnect();
        cancelAnimationFrame(this.resizeFrame);
    }

    attributeChangedCallback(name, _, value) {
        if (name === 'min') this.minFont = parseFloat(value) || this.defaultMinFont;
        if (name === 'max') this.maxAttributeFont = parseFloat(value) || null;
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
        emit(this, 'text-resized', this);
    }
}
