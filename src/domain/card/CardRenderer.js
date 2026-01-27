import { buildCard } from './cardBuilder.js';
import { getActiveSet } from '../sets/setManager.js';

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
            img.src = getActiveSet().defaultBackFace;
        });
    }

    async renderCardFace(face, cardFace) {
        if (!face) return this.renderDefaultFace();
        return new Promise((resolve) => {
            const onInitialized = () => {
                cardFace.removeEventListener('card-face:initialized', onInitialized);
                resolve(cardFace);
            };
            cardFace.addEventListener('card-face:initialized', onInitialized);
            cardFace.face = face;
        });
    }

    async render(faceKey, cardFace) {
        this._card ??= await buildCard(this.baseCard);
        return this.renderCardFace(this._card[faceKey], cardFace);
    }
}
