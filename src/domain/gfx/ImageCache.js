import { loadImage } from '../../shared/imageUtils.js';

const REVOKE_DELAY = 500;

export class ImageCache {
    localPath = 'cache/images';
    cache = new Map();
    objectUrlMap = new Map();

    constructor(basePath) {
        this.cachePath = `${basePath}/${this.localPath}`;
    }

    has(filename) {
        const fullPath = `${this.cachePath}/${filename}`;
        return this.cache.has(fullPath);
    }

    get(filename) {
        const fullPath = `${this.cachePath}/${filename}`;
        return this.cache.get(fullPath);
    }

    async preload() {
        const entries = await Neutralino.filesystem.readDirectory(this.cachePath);
        for (const { type, entry } of entries) {
            if (type !== 'FILE') continue;
            const localPath = `${this.localPath}/${entry}`;
            const fullPath = `${this.cachePath}/${entry}`;
            await loadImage(localPath);
            this.cache.set(fullPath, localPath);
        }
    }

    reset() {
        this.cache.clear();
        this.objectUrlMap.forEach(url => URL.revokeObjectURL(url));
        this.objectUrlMap.clear();
    }

    async saveBlobToDisk(blob, localPath, fullPath) {
        const arrayBuffer = await blob.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        await Neutralino.filesystem.writeBinaryFile(fullPath, uint8);
        this.cache.set(fullPath, localPath);
    }

    async save(filename, canvas, imageFormat, imageQuality) {
        const fullPath = `${this.cachePath}/${filename}`;
        const localPath = `${this.localPath}/${filename}`;
        const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, imageFormat, imageQuality);
        });
        const objectUrl = URL.createObjectURL(blob);
        this.objectUrlMap.set(objectUrl, localPath);
        this.cache.set(fullPath, objectUrl);
        this.saveBlobToDisk(blob, localPath, fullPath).then(() => {
            setTimeout(() => URL.revokeObjectURL(objectUrl), REVOKE_DELAY);
        });
        return objectUrl;
    }
}

const imageCache = new ImageCache(NL_DATAPATH);
export default imageCache;
