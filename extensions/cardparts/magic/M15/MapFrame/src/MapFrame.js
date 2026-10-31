import CardFrame from '../../Frame/src/CardFrame.js';
import Frame from '../../Frame/src/mixins/Frame.js';
import Border from '../../Frame/src/mixins/Border.js';
import PT from '../../Frame/src/mixins/PT.js';

export default class MapFrame extends CardFrame.with(
    Frame,
    Border,
    PT,
) {
    static matches() {
        return true;
    }

    resolveMapAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    // --- FRAME RESOLUTION ---
    get frameExt() {
        return '.png';
    }

    get frameMaskFolder() {
        return this.resolveMapAssetPath('mask/frame');
    }

    get frameFolder() {
        return this.resolveMapAssetPath(`frame/map`);
    }

    get frameMaskFilename() {
        return 'map.png';
    }

    get frameBlendMaskFolder() {
        return this.resolveMapAssetPath('mask/map');
    }

    get frameId() {
        return 'map';
    }

    maskFrame(imageUrl) {
        // TODO: image size mismatch
        return imageUrl;
    }
}
