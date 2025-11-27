import { emit } from '../../utils.js';

class Card extends HTMLElement {
    _card;
    canFlip = false;
    initializedFaces = new Set();

    constructor() {
        super();
        this.finishInitializing = this.finishInitializing.bind(this);
    }

    connectedCallback() {
        if (!this._card) return;
        this.renderFaces();
    }

    set card(card) {
        this._card = card;
        this.canFlip = Boolean(card?.model?.front && card?.model?.back);
        if (this.isConnected) this.renderFaces();
    }

    get card() {
        return this._card;
    }

    startInitializing() {
        this.initializedFaces.clear();
        this.expectedFaceCount = Object.keys(this._card.model).length;
        emit(document, 'freeze-resize');
        this.classList.add('initializing');
        this.addEventListener(
            'card-face:initialized',
            this.finishInitializing
        );
    }

    finishInitializing(e) {
        const face = e.target;
        this.initializedFaces.add(face);
        if (this.expectedFaceCount !== this.initializedFaces.size)
            return;

        this.classList.remove('initializing');
        this.removeEventListener(
            'card-face:initialized',
            this.finishInitializing
        );
        emit(document, 'thaw-resize');
    }

    renderFaces() {
        this.innerHTML = '';
        if (!this._card?.model) return;

        this.startInitializing();
        for (const faceName of Object.keys(this._card.model)) {
            const faceData = this._card.model[faceName];
            const faceEl = document.createElement('cm-card-face');
            faceEl.face = faceData;
            this.appendChild(faceEl);
        }

        if (this.canFlip) this.classList.add('flip-container');
    }

    flip() {
        if (!this.canFlip || window.__EXPORTING__) return;
        if (this.classList.contains('flipping')) {
            this.classList.toggle('flipped');
            return;
        }

        this.classList.add('flipping');

        const onEnd = e => {
            if (!(e.target instanceof Element) || e.propertyName !== 'transform') return;
            this.classList.remove('flipping');
            this.dispatchEvent(new CustomEvent('card-flip-end', { bubbles: true }));
            this.removeEventListener('transitionend', onEnd);
        };

        this.classList.toggle('flipped');
        this.dispatchEvent(new CustomEvent('card-flip-start', { bubbles: true }));
        this.addEventListener('transitionend', onEnd);
    }
}

customElements.define('cm-card', Card);
