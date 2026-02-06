import M15MainframeTokensImporter from './cardImporters/M15MainframeTokensImporter.js';
import M15MainframeDFCImporter from './cardImporters/M15MainframeDFCImporter.js';
import M15AlteredImporter from './cardImporters/M15AlteredImporter.js';

const cardImporters = [
    M15MainframeTokensImporter,
    M15MainframeDFCImporter,
    M15AlteredImporter,
];

export function createImporter(mseSet, mseCard, cmCard, folderPath) {
    for (const CardImporter of cardImporters) {
        if (CardImporter.match(mseCard, mseSet))
            return new CardImporter(mseCard, cmCard, mseSet, folderPath);
    }
}
