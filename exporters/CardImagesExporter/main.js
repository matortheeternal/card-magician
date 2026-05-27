import CardImageArtifact from './src/CardImageArtifact.js';

const L = localize('card-images-exporter');

function expandCanvas(canvas, padding) {
    if (!padding || !canvas.width || !canvas.height) return canvas;

    const newCanvas = document.createElement('canvas');
    newCanvas.width = canvas.width + padding * 2;
    newCanvas.height = canvas.height + padding * 2;

    const ctx = newCanvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
    ctx.drawImage(canvas, padding, padding);

    return newCanvas;
}

export default class CardImagesExporter extends CardMagicianExporter {
    saveOutputs = true;

    static get options() {
        return [{
            id: 'imageType',
            label: L`Image Type`,
            type: 'select',
            options: [
                { id: 'jpg', name: L`JPG` },
                { id: 'png', name: L`PNG` },
            ]
        }, {
            id: 'quality',
            label: L`Image Quality`,
            default: '0.92',
            hint: L`A number between 0 and 1 indicating the image quality to be used
                    when creating images using file formats that support lossy compression.`
        }, {
            id: 'scale',
            label: L`Scale`,
            default: '2',
            hint: L`A number corresponding to how much the base card size should be
                    scaled. A value of 2 corresponds to doubling the size.`
        }, {
            id: 'bleed',
            label: L`Bleed`,
            default: '0',
            hint: L`A number corresponding to the number of pixels of bleed outline to
                    add around exported images.`
        }];
    }

    get extension() {
        return this.config.imageType.id;
    }

    async prepare() {
        this.activeSet.imageExportPath = 'dist/images/';
    }

    /**
     * @param {CardSheetArtifact} cardSheetArtifact
     * @yields {Promise<OutputItem>}
     */
    async *transform(cardSheetArtifact) {
        for await (const { card, cardCanvas } of cardSheetArtifact.cardOutputs({
            scale: this.config.scale
        })) {
            const baseCard = card.card.baseCard;
            const hasBackFace = Object.hasOwn(baseCard, 'back');
            const suffix = hasBackFace ? ` - ${card.faceKey}` : '';
            const filePath = `${baseCard.baseName}${suffix}.${this.extension}`;
            baseCard.imageExports ||= {};
            baseCard.imageExports[card.faceKey] = filePath;
            const artifact = new CardImageArtifact(
                expandCanvas(cardCanvas, this.config.bleed * this.config.scale),
                this.config
            );
            yield { filePath, artifact };
        }
    }

    getOutputCount() {
        return this.activeSet.cards.reduce((total, card) => {
            return total + 1 + (Object.hasOwn(card, 'back') ? 1 : 0);
        }, 0);
    }
}
