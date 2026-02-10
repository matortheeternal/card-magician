import M15MainframeTokensImporter from './cardImporters/M15MainframeTokensImporter.js';
import M15MainframeDFCImporter from './cardImporters/M15MainframeDFCImporter.js';
import M15AlteredImporter from './cardImporters/M15AlteredImporter.js';
import M15FallbackImporter from './cardImporters/M15FallbackImporter.js';

const cardImporters = [
    M15MainframeTokensImporter,
    M15MainframeDFCImporter,
    M15AlteredImporter,
    M15FallbackImporter
];

export function createImporter(mseSet, mseCard, cmCard, folderPath) {
    for (const CardImporter of cardImporters) {
        if (CardImporter.match(mseCard, mseSet))
            return new CardImporter(mseCard, cmCard, mseSet, folderPath);
    }
}
