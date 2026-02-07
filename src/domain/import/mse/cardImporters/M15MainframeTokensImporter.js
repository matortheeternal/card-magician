import { tokenPropImporters } from '../cardPropertyImporters.js';
import M15AlteredImporter from './M15AlteredImporter.js';

export default class M15MainframeTokensImporter extends M15AlteredImporter {
    static expectedVersion = '2025-01-11';
    static expectedStylesheet = 'm15-mainframe-tokens';

    get template() {
        return this.mseFrames.includes('M20') ? 'M20Token' : 'M15Token';
    }

    getPropImporter(key) {
        return tokenPropImporters[key] || super.getPropImporter(key);
    }
}
