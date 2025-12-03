import { getImageSize } from '../gfx/imageProcessing.js';

async function base64ToBlob(base64, mime) {
    const res = await fetch(`data:${mime};base64,${base64}`);
    return await res.blob();
}

const base64Marker = ';base64,';
function parseDataURL(raw) {
    const start = raw.lastIndexOf('data:');
    if (start === -1) return {};

    const candidate = raw.slice(start);
    const markerIndex = candidate.indexOf(base64Marker);
    if (markerIndex === -1) return {};

    const mime = candidate.slice(5, markerIndex);
    if (!mime.includes('/')) return {};

    const base64 = candidate.slice(markerIndex + base64Marker.length);
    return base64.length > 0 ? { base64, mime } : {};
}

async function loadLegacyImage(stored) {
    const raw = stored.image;
    if (!raw || typeof raw !== 'string') return null;

    const { base64, mime } = parseDataURL(raw);
    if (!base64) return null;

    const blob = await fetch(`data:${mime};base64,${base64}`).then(r => r.blob());
    return URL.createObjectURL(blob);
}

async function loadBase64Blob(stored) {
    const { imageBase64, type } = stored;
    if (!imageBase64 || !type) return null;
    const blob = await base64ToBlob(imageBase64, type);
    return URL.createObjectURL(blob);
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            resolve(result.split(',')[1]);
        };
        reader.onerror = () => reject(new Error("Failed to read blob"));
        reader.readAsDataURL(blob);
    });
}

export class CropValue {
    constructor(width = 0, height = 0, xOffset = 0, yOffset = 0) {
        this.width = width;
        this.height = height;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
    }

    static load(data) {
        return new CropValue(
            data.width || 0,
            data.height || 0,
            data.xOffset || 0,
            data.yOffset || 0
        );
    }
}

export default class ImageValue {
    constructor(imageUrl = null, filename = '', width = 0, height = 0, crop) {
        this.imageUrl = imageUrl;
        this.filename = filename;
        this.width = width;
        this.height = height;
        this.crop = crop || new CropValue();
    }

    static async fromFile(file) {
        const imageUrl = URL.createObjectURL(file);
        const { width, height } = await getImageSize(imageUrl);
        const crop = new CropValue(width, height);
        return new this(imageUrl, file.name, width, height, crop);
    }

    static async load(data) {
        const imageUrl = await loadBase64Blob(data) || await loadLegacyImage(data);
        return new this(
            imageUrl,
            data.filename || '',
            data.width || 0,
            data.height || 0,
            CropValue.load(data)
        );
    }

    async encodeBlob() {
        if (!this.imageUrl) return { imageBase64: null, type: null };
        const blob = await fetch(this.imageUrl).then(r => r.blob());
        const base64 = await blobToBase64(blob);
        return { base64, type: blob.type };
    }

    async save() {
        return {
            ...await this.encodeBlob(),
            filename: this.filename,
            width: this.width,
            height: this.height,
            ...this.crop.save()
        }
    }
}
