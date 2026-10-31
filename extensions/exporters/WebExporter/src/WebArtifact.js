import { getPropertyWriter } from './propertyWriters.js';

export default class WebArtifact extends ExportArtifact {
    constructor(config) {
        super();
        this.baseUrl = config.baseUrl;
    }

    exportCardFace(card, faceKey) {
        return Object.entries(card[faceKey]).reduce((output, [key, value]) => {
            const writer = getPropertyWriter(value);
            const outValue = writer.write(value);
            if (outValue) output[key] = outValue;
            return output;
        }, {});
    }

    get cards() {
        return window.activeProject.cards.map(card => {
            const exportedCard = { ...card };
            exportedCard.front = this.exportCardFace(card, 'front');
            if (card.back)
                exportedCard.back = this.exportCardFace(card, 'back');
            exportedCard.baseName = card.baseName;
            return exportedCard;
        });
    }

    get set() {
        return {
            ...window.activeProject,
            cards: this.cards,
            baseUrl: this.baseUrl
        }
    }

    async toBuffer() {
        return JSON.stringify(this.set);
    }
}
