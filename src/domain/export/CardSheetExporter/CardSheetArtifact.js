import ExportArtifact from '../ExportArtifact.js';
import Stopwatch from '../../../shared/Stopwatch.js';
import { cardToCanvas } from '../cardToCanvas/cardToCanvas.js';

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

    get length() {
        return this.cards.length;
    }

    get gap() {
        return parseInt(this.config.gap);
    }

    get columns() {
        return parseInt(this.config.columns);
    }

    get rows() {
        return parseInt(this.config.rows);
    }

    get scale() {
        return parseFloat(this.config.scale) || 1;
    }

    add(entry) {
        this.cards.push(entry);
    }

    createCardsContainer() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '1000em';
        document.body.appendChild(container);
        return container;
    }

    async createCardElements(container) {
        return Promise.all(this.cards.map(async cardSlot => {
            const cardFace = document.createElement('cm-card-face');
            container.appendChild(cardFace);
            return cardSlot.card.render(cardSlot.faceKey, cardFace);
        }));
    }

    async cardsRendered(container) {
        const cardFaces = [...container.querySelectorAll('cm-card-face')];
        await Promise.all(cardFaces.map(cardFace => cardFace.rendered()));
    }

    applyGridStyle(container) {
        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(${this.config.columns}, auto)`;
        container.style.gap = `${this.config.gap}px`;
        container.style.background = this.config.backgroundColor;
        container.style.width = 'max-content';
    }

    async capture() {
        const tracker = new Stopwatch('CardSheetArtifact');

        const container = this.createCardsContainer();
        this.applyGridStyle(container);
        tracker.lap('createCardsContainer');

        await this.createCardElements(container);
        tracker.lap('createCardElements');

        await this.cardsRendered(container);
        tracker.lap('cardsRendered');

        try {
            const result = await cardToCanvas(container, { scale: this.scale });
            tracker.lap('cardToCanvas');
            return result;
        } catch (error) {
            return Promise.reject(error);
        } finally {
            container.remove();
            tracker.complete();
        }
    }

    get capturePromise() {
        return this._capture ??= this.capture();
    }

    /**
     * @yields {Promise<CardOutput>}
     */
    async *cardOutputs(options = {}) {
        const tracker = new Stopwatch('CardSheetArtifact');

        this.cardsContainer = this.createCardsContainer();
        this.applyGridStyle(this.cardsContainer);
        tracker.lap('createCardsContainer');

        await this.createCardElements(this.cardsContainer);
        tracker.lap('createCardElements');

        await this.cardsRendered(this.cardsContainer);
        tracker.lap('cardsRendered');

        try {
            for (let i = 0; i < this.cards.length; i++) {
                const card = this.cards[i];
                const cardElement = this.cardsContainer.children[i];
                const cardCanvas = await cardToCanvas(cardElement, options);
                yield { card, cardCanvas };
            }
        } catch (error) {
            return Promise.reject(error);
        } finally {
            tracker.complete('cardOutputs');
        }
    }

    cleanup() {
        this.cardsContainer.remove();
    }

    async toBuffer() {
        const canvas = await this.capturePromise;
        const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, this.config.imageType, this.config.quality);
        });
        if (!blob) return;
        const arrayBuffer = await blob.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    }
}
