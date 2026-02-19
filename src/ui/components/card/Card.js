import { getFaceKeys } from '../../../domain/card/cardBuilder.js';

class Card extends HTMLElement {
    #card;
    canFlip = false;
    canRotate = false;
    initializedFaces = new Set();

    constructor() {
        super();
        this.finishInitializing = this.finishInitializing.bind(this);
    }

    connectedCallback() {
        if (!this.#card) return;
        this.renderFaces();
    }

    set card(card) {
        this.#card = card;
        this.canFlip = Boolean(card?.front && card?.back);
        this.canRotate = Boolean(card?.front?.canRotate);
        if (this.isConnected) this.renderFaces();
    }

    get card() {
        return this.#card;
    }

    startInitializing() {
        this.initializedFaces.clear();
        this.expectedFaceCount = getFaceKeys(this.#card).length;
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
    }

    renderFace(face) {
        if (!face) return;
        const faceElement = document.createElement('cm-card-face');
        faceElement.face = face;
        this.appendChild(faceElement);
    }

    renderFaces() {
        this.innerHTML = '';
        if (!this.#card) return;

        this.startInitializing();

        this.classList.toggle('flip-container', this.canFlip);
        this.classList.toggle('flipping', false);
        this.classList.toggle('flipped', false);
        this.classList.toggle('rotated', false);

        this.renderFace(this.#card.front);
        this.renderFace(this.#card.back);
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

    rotate() {
        if (!this.canRotate) return;
        if (this.classList.contains('rotating')) {
            this.classList.toggle('rotated');
            return;
        }

        this.classList.add('rotating');

        const onEnd = e => {
            if (!(e.target instanceof Element) || e.propertyName !== 'transform') return;
            this.classList.remove('rotating');
            this.classList.toggle('rotated');
            this.dispatchEvent(new CustomEvent('card-rotate-end', { bubbles: true }));
            this.removeEventListener('transitionend', onEnd);
        };

        this.dispatchEvent(new CustomEvent('card-rotate-start', { bubbles: true }));
        this.addEventListener('transitionend', onEnd);
    }
}

customElements.define('cm-card', Card);
