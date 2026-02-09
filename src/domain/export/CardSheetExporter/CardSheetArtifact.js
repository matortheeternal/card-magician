import ExportArtifact from '../ExportArtifact.js';
import { waitForStableLayout } from '../../../shared/htmlUtils.js';
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
        return parseInt(this.config.scale) || 1;
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

        await waitForStableLayout(container);
        tracker.lap('waitForStableLayout');

        try {
            const result = await cardToCanvas(container, { scale: this.scale });
            tracker.lap('cardToCanvas');
            return result;
        } catch (error) {
            return Promise.reject(error);
        } finally {
            document.body.removeChild(container.parentElement);
            tracker.complete();
        }
    }

    get capturePromise() {
        return this._capture ??= this.capture();
    }

    /**
     * @yields {Promise<CardOutput>}
     */
    async *cardOutputs() {
        const tracker = new Stopwatch('CardSheetArtifact');

        const container = this.createCardsContainer();
        this.applyGridStyle(container);
        tracker.lap('createCardsContainer');

        await this.createCardElements(container);
        tracker.lap('createCardElements');

        await waitForStableLayout(container);
        tracker.lap('waitForStableLayout');

        try {
            const options = { scale: this.scale };
            for (let i = 0; i < this.cards.length; i++) {
                const card = this.cards[i];
                const cardElement = container.children[i];
                const cardCanvas = await cardToCanvas(cardElement, options);
                yield { card, cardCanvas };
            }
        } catch (error) {
            return Promise.reject(error);
        } finally {
            document.body.removeChild(container);
            tracker.complete();
        }
    }

    async toBuffer() {
        const canvas = await this.capturePromise;
        const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, this.config.imageType, this.config.quality);
        });
        const arrayBuffer = await blob.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    }
}
