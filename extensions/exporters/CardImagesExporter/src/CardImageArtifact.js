const MIME_TYPES = {
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
};

async function getCanvasHash(canvas) {
    const dataURL = canvas.toDataURL();
    const encoder = new TextEncoder();
    const data = encoder.encode(dataURL);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default class CardImageArtifact extends ExportArtifact {
    constructor(baseCard, faceKey, cardCanvas, config) {
        super();
        this.baseCard = baseCard;
        this.faceKey = faceKey;
        this.cardCanvas = cardCanvas;
        this.config = config;
    }

    get card() {
        return this.baseCard;
    }

    get imageType() {
        return MIME_TYPES[this.config.imageType];
    }

    get imageQuality() {
        return parseFloat(this.config.quality);
    }

    async hash() {
        return await getCanvasHash(this.cardCanvas);
    }

    async toBuffer() {
        const blob = await new Promise(resolve => {
            this.cardCanvas.toBlob(resolve, this.imageType, this.imageQuality);
        });
        if (!blob) return;
        const arrayBuffer = await blob.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    }
}
