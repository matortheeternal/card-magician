import NormalFrame from '../../Frame/src/NormalFrame.js';

function resolveAssetPath(path) {
    return new URL(`../assets/${path}`, import.meta.url).pathname;
}

export default class MapFrame extends NormalFrame {
    frame = [this.resolveFrame];

    // --- FRAME RESOLUTION ---
    get frameExt() {
        return '.png';
    }

    get frameMaskFolder() {
        return resolveAssetPath('mask/frame');
    }

    get frameFolder() {
        return resolveAssetPath(`frame/map`);
    }

    get frameMaskFilename() {
        return 'map.png';
    }

    get frameBlendMaskFolder() {
        return resolveAssetPath('mask/map');
    }

    async maskFrame(imageUrl) {
        // TODO: image size mismatch
        return imageUrl;
    }
}
