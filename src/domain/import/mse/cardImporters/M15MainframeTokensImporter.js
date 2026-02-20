import { tokenPropImporters } from '../cardPropertyImporters.js';
import M15AlteredImporter from './M15AlteredImporter.js';

export default class M15MainframeTokensImporter extends M15AlteredImporter {
    static expectedVersion = '2025-01-11';
    static expectedStylesheet = 'm15-mainframe-tokens';

    get template() {
        return this.mseFrames.includes('M20') ? 'magic/M20/Token' : 'magic/M15/Token';
    }

    get otherOptions() {
        const optionsValue = this.stylingData?.other_options;
        return optionsValue ? optionsValue.split(', ') : [];
    }

    async importOptions(cmCardFace) {
        cmCardFace.otherFrameOptions = {
            tall: this.mseFrames.includes('tall'),
            hideSymbol: this.otherOptions.includes('remove rarity symbol')
        };
    }

    getPropImporter(key) {
        return tokenPropImporters[key] || super.getPropImporter(key);
    }
}
