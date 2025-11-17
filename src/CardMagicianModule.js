import { getImageUrl, loadFont, loadImport, loadTextFile } from './services/fsHelpers.js';
import {
    combineBlendUrl,
    linearBlendUrl,
    maskBlendUrl,
    maskColorUrl,
    maskImageUrl
} from './gfx/blending.js';
import Alpine from 'alpinejs';

export default class CardMagicianModule {
    constructor(card, modulePath) {
        this.card = card;
        this.modulePath = modulePath;
        this.name = modulePath.split('/').pop();
    }

    async assetURL(path) {
        const filePath = ['modules', this.modulePath, 'assets', path].join('/');
        return await getImageUrl(filePath);
    }

    async loadFile(filename) {
        const filePath = ['modules', this.modulePath, filename].join('/');
        return await loadTextFile(filePath);
    }

    async maskColor(sourceUrl, color) {
        return await maskColorUrl(sourceUrl, color);
    }

    async maskImage(sourceUrl, maskUrl) {
        return await maskImageUrl(sourceUrl, maskUrl);
    }

    async combineBlend(imgUrlA, imgUrlB, mode = 'symmetricOverlay') {
        return await combineBlendUrl(imgUrlA, imgUrlB, mode);
    }

    async linearBlend(imgUrlA, imgUrlB, x1, y1, x2, y2) {
        return await linearBlendUrl(imgUrlA, imgUrlB, x1, y1, x2, y2);
    }

    async maskedBlend(imgToMaskUrl, baseImgUrl, maskUrl) {
        return await maskBlendUrl(imgToMaskUrl, baseImgUrl, maskUrl);
    }

    async loadFont(fontName, localPath) {
        const filePath = ['modules', this.modulePath, 'assets', localPath].join('/');
        await loadFont(fontName, filePath);
    }

    async import(localPath) {
        const filePath = ['modules', this.modulePath, localPath].join('/');
        return await loadImport(filePath);
    }

    makeReactive(obj) {
        return Alpine.reactive(obj);
    }
}
