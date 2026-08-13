import { buildCard } from './cardBuilder.js';

export default class CardRenderer {
    constructor(baseCard) {
        this._cache = {};
        this.baseCard = baseCard;
    }

    async renderDefaultFace() {
        return new Promise(resolve => {
            const img = document.createElement('img');
            img.onload = () => resolve(img);
            img.className = 'default-card-back';
            img.src = activeProject.defaultBackImage;
        });
    }

    async renderCardFace(face, cardFace) {
        if (!face) return this.renderDefaultFace();
        cardFace.face = face;
        return cardFace;
    }

    async render(faceKey, cardFace) {
        this._card ??= await buildCard(this.baseCard);
        return this.renderCardFace(this._card[faceKey], cardFace);
    }
}
