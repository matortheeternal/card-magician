import { snapdom } from '@zumer/snapdom';
import ExportArtifact from '../ExportArtifact.js';
import bake from '../../../shared/theBakery.js';
import { waitForStableLayout } from '../../../shared/htmlUtils.js';
import Stopwatch from '../../../shared/Stopwatch.js';

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

    add(entry) {
        this.cards.push(entry);
    }

    createCardsContainer() {
        const reset = document.createElement('div');
        const container = document.createElement('div');
        // container.style.position = 'absolute';
        // reset.style.marginTop = '1000em';
        reset.style.all = 'initial';
        reset.appendChild(container);
        document.body.appendChild(reset);
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
        tracker.lap('createCardsContainer');

        await this.createCardElements(container);
        tracker.lap('createCardElements');

        await waitForStableLayout(container);
        tracker.lap('waitForStableLayout');

        bake(container);
        tracker.lap('bake');

        this.applyGridStyle(container);
        tracker.lap('applyGridStyle');

        await waitForStableLayout(container);
        tracker.lap('waitForStableLayout');

        try {
            const result = await snapdom(container, {
                embedFonts: true,
                cache: 'full'
            });
            tracker.lap('snapdom');
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

    cutCard(canvas, index, cardWidth, cardHeight) {
        const col = index % this.columns;
        const row = Math.floor(index / this.columns);
        const x = col * (cardWidth + this.gap);
        const y = row * (cardHeight + this.gap);

        const cardCanvas = document.createElement('canvas');
        cardCanvas.width = cardWidth;
        cardCanvas.height = cardHeight;
        const ctx = cardCanvas.getContext('2d');
        ctx.drawImage(canvas, x, y, cardWidth, cardHeight, 0, 0, cardWidth, cardHeight);

        return cardCanvas;
    }

    getCanvasCardWidth(canvas) {
        const numColumns = Math.min(this.columns, this.cards.length);
        const widthGap = (numColumns - 1) * this.gap;
        return (canvas.width - widthGap) / numColumns;
    }

    getCanvasCardHeight(canvas) {
        const numRows = Math.ceil(this.cards.length / this.columns);
        const heightGap = (numRows - 1) * this.gap;
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
