class Card extends HTMLElement {
    _card;
    canFlip = false;

    connectedCallback() {
        if (!this._card) return;
        this.renderFaces();
    }

    set card(card) {
        this._card = card;
        this.canFlip = Boolean(card?.model.front && card?.model.back);
        if (this.isConnected) this.renderFaces();
    }

    get card() {
        return this._card;
    }

    renderFaces() {
        this.innerHTML = '';
        if (!this._card) return;

        for (const faceName of Object.keys(this._card.model)) {
            const faceData = this._card.model[faceName];
            const faceEl = document.createElement('cm-card-face');
            faceEl.face = faceData;
            this.appendChild(faceEl);
        }

        this.classList.toggle('flip-container', this.canFlip);
    }

    flip() {
        if (!this.canFlip) return;
        this.classList.toggle('flipped');
    }
}

customElements.define('cm-card', Card);
