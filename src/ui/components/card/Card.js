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
        this.canFlip = Boolean(card?.front && card?.back);
        if (this.isConnected) this.renderFaces();
    }

    get card() {
        return this._card;
    }

    startInitializing() {
        this.initializedFaces.clear();
        this.expectedFaceCount = Object.keys(this._card).length;
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

    renderFaces() {
        this.innerHTML = '';
        if (!this._card) return;

        this.startInitializing();
        for (const faceName of Object.keys(this._card)) {
            const faceData = this._card[faceName];
            const faceEl = document.createElement('cm-card-face');
            faceEl.face = faceData;
            this.appendChild(faceEl);
        }

        this.classList.toggle('flip-container', this.canFlip);
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
