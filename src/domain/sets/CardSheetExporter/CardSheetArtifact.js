import { snapdom } from '@zumer/snapdom';
import ExportArtifact from '../ExportArtifact.js';

/**
 * @typedef CardOutput
 *
 * @property {object} card
 * @property {HTMLCanvasElement} cardCanvas
 */

export default class CardSheetArtifact extends ExportArtifact {
    constructor(config) {
        super();
        this.config = config;
        this.cards = [];
    }

    dispose() {
        this._capture = null;
        this.config = null;
        this.cards = null;
    }

    get length() {
        return this.cards.length;
    }

    add(entry) {
        this.cards.push(entry);
    }

    createCardsContainer() {
        const container = document.createElement('div');
        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(${this.config.columns}, auto)`;
        container.style.gap = `${this.config.gap}px`;
        container.style.width = 'max-content';
        container.style.background = this.config.backgroundColor;
        return container;
    }

    async createCardElements(container) {
        return Promise.all(this.cards.map(async cardSlot => {
            const cardFace = document.createElement('cm-card-face');
            container.appendChild(cardFace);
            return cardSlot.card.render(cardSlot.faceKey, cardFace);
        }));
    }

    async capture() {
        const container = this.createCardsContainer();
        await this.createCardElements(container);
        document.body.appendChild(container);

        try {
            return await snapdom(container, {
                embedFonts: true,
                cache: 'full',
                scale: this.config.scale
            });
        } finally {
            document.body.removeChild(container);
        }
    }

    get capturePromise() {
        return this._capture ??= this.capture();
    }

    cutCard(canvas, index, cardWidth, cardHeight) {
        const col = index % this.config.columns;
        const row = Math.floor(index / this.config.columns);
        const x = col * (cardWidth + this.config.gap);
        const y = row * (cardHeight + this.config.gap);

        const cardCanvas = document.createElement('canvas');
        cardCanvas.width = cardWidth;
        cardCanvas.height = cardHeight;
        const ctx = cardCanvas.getContext('2d');
        ctx.drawImage(canvas, x, y, cardWidth, cardHeight, 0, 0, cardWidth, cardHeight);

        return cardCanvas;
    }

    getCanvasCardWidth(canvas) {
        const numColumns = Math.min(this.config.columns, this.cards.length);
        const widthGap = (numColumns - 1) * this.config.gap;
        return (canvas.width - widthGap) / numColumns;
    }

    getCanvasCardHeight(canvas) {
        const numRows = Math.ceil(this.cards.length / this.config.columns);
        const heightGap = (numRows - 1) * this.config.gap;
        return (canvas.height - heightGap) / numRows;
    }

    /**
     * @yields {Promise<CardOutput>}
     */
    async *cardOutputs() {
        const result = await this.capturePromise;
        const canvas = await result.toCanvas();

        const cardWidth = this.getCanvasCardWidth(canvas);
        const cardHeight = this.getCanvasCardHeight(canvas);

        for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i];
            const cardCanvas = this.cutCard(canvas, i, cardWidth, cardHeight);
            yield { card, cardCanvas };
        }
    }

    async toBuffer() {
        const result = await this.capturePromise;
        const blob = await result.toBlob({
            type: this.config.imageType,
            quality: this.config.quality,
        });
        const arrayBuffer = await blob.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    }
}
