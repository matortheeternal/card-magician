import CardSheetArtifact from './CardSheetArtifact.js';
import CardRenderer from '../../card/CardRenderer.js';

export default class CardSheetPair {
    constructor(config, sheetNumber) {
        this.config = config;
        this.sheetNumber = sheetNumber;
        this.front = new CardSheetArtifact(config);
        this.back = new CardSheetArtifact(config);
    }

    get extension() {
        return this.config.imageType;
    }

    get adjacentBackFaces() {
        return this.config.backFaceMode === 'adjacent';
    }

    get maxLength() {
        return this.config.rows * this.config.columns
            - (this.config.leaveLastEmpty ? 1 : 0);
    }

    hasSpaceFor(baseCard) {
        const numFaces = baseCard.back && this.adjacentBackFaces ? 2 : 1;
        return this.front.length + numFaces <= this.maxLength;
    }

    add(baseCard) {
        const card = new CardRenderer(baseCard);
        this.front.add({ card, faceKey: 'front' });
        if (!baseCard.back && this.adjacentBackFaces) return;
        const target = this.adjacentBackFaces ? this.front : this.back;
        target.add({ card, faceKey: 'back' });
    }

    getFilePath(faceKey) {
        return this.back.length > 0
            ? `sheet-${this.sheetNumber}-${faceKey}.${this.extension}`
            : `sheet-${this.sheetNumber}.${this.extension}`;
    }

    async *produce() {
        for (const faceKey of ['front', 'back']) {
            if (!this[faceKey].length) continue;
            const filePath = this.getFilePath(faceKey);
            const artifact = new CardSheetArtifact(this, faceKey);
            yield { filePath, artifact };
        }
    }
}
