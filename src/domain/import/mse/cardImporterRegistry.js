import M15MainframeTokensImporter from './cardImporters/M15MainframeTokensImporter.js';
import M15MainframeDFCImporter from './cardImporters/M15MainframeDFCImporter.js';
import M15AlteredImporter from './cardImporters/M15AlteredImporter.js';
import M15FallbackImporter from './cardImporters/M15FallbackImporter.js';
import M15AdventureImporter from './cardImporters/M15AdventureImporter.js';
import M15SagaImporter from './cardImporters/M15SagaImporter.js';
import M15FullArtBasicLandImporter from './cardImporters/M15TextlessLandImporter.js';

const cardImporters = [
    M15MainframeTokensImporter,
    M15MainframeDFCImporter,
    M15AlteredImporter,
    M15AdventureImporter,
    M15SagaImporter,
    M15FullArtBasicLandImporter,
    M15FallbackImporter
];

export function createImporter(mseSet, mseCard, cmCard, adapter) {
    for (const CardImporter of cardImporters) {
        if (CardImporter.match(mseCard, mseSet))
            return new CardImporter(mseCard, cmCard, mseSet, adapter);
    }
}
