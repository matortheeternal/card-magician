import { getImageUrl, loadFont } from './fsHelpers';
import { maskImage, parseBlob } from './gfx/imageProcessing';
import { combineBlendUrl, linearBlendUrl } from './gfx/blending';

export const buildModuleUtils = (modulePath) => ({
    async assetURL(path) {
        const filePath = ['modules', modulePath, 'assets', path].join('/');
        return await getImageUrl(filePath);
    },
    async loadFile(filename) {
        const filePath = ['modules', modulePath, filename].join('/');
        return await Neutralino.filesystem.readFile(filePath);
    },
    async maskImage(sourceUrl, maskUrl, width, height) {
        return await maskImage(sourceUrl, maskUrl, width, height);
    },
    disposeImage(card, key) {
        if (!card[key]) return;
        URL.revokeObjectURL(card[key]);
    },
    parseBlob(text) {
        return parseBlob(text);
    },
    async combineBlend(imgUrl1, imgUrl2, mode = 'symmetricOverlay') {
        return await combineBlendUrl(imgUrl1, imgUrl2, mode);
    },
    async linearBlend(imgUrl1, imgUrl2, x1, y1, x2, y2) {
        return await linearBlendUrl(imgUrl1, imgUrl2, x1, y1, x2, y2);
    },
    async loadFont(fontName, localPath) {
        const filePath = ['modules', modulePath, 'assets', localPath].join('/');
        await loadFont(fontName, filePath);
    }
});
