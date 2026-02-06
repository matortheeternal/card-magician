import M15MainframeDFCImporter from './M15MainframeDFCImporter.js';
import { tokenPropImporters } from '../cardPropertyImporters.js';

export default class M15MainframeTokensImporter extends M15MainframeDFCImporter {
    static expectedVersion = '2025-01-11';
    static expectedStylesheet = 'm15-mainframe-tokens';

    get frames() {
        const framesValue = this.stylingData?.frames;
        return framesValue ? framesValue.split(', ') : [];
    }

    get template() {
        return this.frames.includes('M20') ? 'M20Token' : 'M15Token';
    }

    getPropImporter(key) {
        return tokenPropImporters[key] || super.getPropImporter(key);
    }
}
