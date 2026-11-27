import CardFrame from '../../Frame/src/CardFrame.js';
import Border from '../../Frame/src/mixins/Border.js';
import PT from '../../Frame/src/mixins/PT.js';
import TopFrame from './mixins/TopFrame.js';
import BottomFrame from './mixins/BottomFrame.js';

export default class AftermathFrame extends CardFrame.with(
    TopFrame,
    BottomFrame,
    Border,
    PT,
) {
    static matches() {
        return true;
    }

    resolveAftermathAssetPath(path) {
        return new URL(`../assets/${path}`, import.meta.url).pathname;
    }

    get artDimensions() {
        return {
            top: { width: 317, height: 117 },
            bottom: { width: 182, height: 107 }
        };
    }

    get borderMaskUrl() {
        return this.resolveAftermathAssetPath('mask/border/base.png');
    }

    resolveHalfFrame(side, half) {
        const frameFolder = this.resolveAftermathAssetPath(`frame/${side}`);
        const halfFrame = this.forSubcard(half);
        const image = halfFrame.coloredBlend(frameFolder, halfFrame.card, {
            ext: '.png',
            blendMaskFolder: this.resolveAftermathAssetPath(`mask/${side}`),
            hasLandTemplates: true
        });
        return this.background(`${side}-frame`, image);
    }
}
