import M15MainframeDFCImporter from './M15MainframeDFCImporter.js';
import { registerCardImporter } from '../cardImporterRegistry.js';

export default class M15MainframeTokensImporter extends M15MainframeDFCImporter {
    static expectedVersion = '2025-01-11';
    static expectedStylesheet = 'm15-mainframe-tokens';
    static template = 'M15Token';
}

registerCardImporter(M15MainframeTokensImporter);
