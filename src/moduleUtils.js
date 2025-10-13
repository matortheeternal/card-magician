import { getImageUrl, loadFont, loadImport } from './fsHelpers';
import { parseBlob } from './gfx/imageProcessing';
import {
    maskImageUrl, combineBlendUrl, linearBlendUrl, maskBlendUrl, maskColorUrl
} from './gfx/blending';

export const buildModuleUtils = (modulePath) => ({
    async assetURL(path) {
        const filePath = ['modules', modulePath, 'assets', path].join('/');
        return await getImageUrl(filePath);
    },
    async loadFile(filename) {
        const filePath = ['modules', modulePath, filename].join('/');
        return await Neutralino.filesystem.readFile(filePath);
    },
    async maskColor(sourceUrl, color) {
        return await maskColorUrl(sourceUrl, color);
    },
    async maskImage(sourceUrl, maskUrl) {
        return await maskImageUrl(sourceUrl, maskUrl);
    },
    async combineBlend(imgUrlA, imgUrlB, mode = 'symmetricOverlay') {
        return await combineBlendUrl(imgUrlA, imgUrlB, mode);
    },
    async linearBlend(imgUrlA, imgUrlB, x1, y1, x2, y2) {
        return await linearBlendUrl(imgUrlA, imgUrlB, x1, y1, x2, y2);
    },
    async maskedBlend(imgToMaskUrl, baseImgUrl, maskUrl) {
        return await maskBlendUrl(imgToMaskUrl, baseImgUrl, maskUrl);
    },
    async loadFont(fontName, localPath) {
        const filePath = ['modules', modulePath, 'assets', localPath].join('/');
        await loadFont(fontName, filePath);
    },
    import(localPath) {
        const filePath = ['modules', modulePath, localPath].join('/');
        return loadImport(filePath);
    }
});
