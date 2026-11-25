import ClassicImporter from './cardImporters/ClassicImporter.js';
import ClassicShiftedImporter from './cardImporters/ClassicShiftedImporter.js';
import ClassicArtbgImporter from './cardImporters/ClassicArtbgImporter.js';
import ClassicShiftedArtbgImporter from './cardImporters/ClassicShiftedArtbgImporter.js';
import ClassicClearImporter from './cardImporters/ClassicClearImporter.js';
import ClassicTokenImporter from './cardImporters/ClassicTokenImporter.js';
import ClassicSagaImporter from './cardImporters/ClassicSagaImporter.js';
import M15MainframeTokensImporter from './cardImporters/M15MainframeTokensImporter.js';
import M15MainframeDFCImporter from './cardImporters/M15MainframeDFCImporter.js';
import M15AlteredImporter from './cardImporters/M15AlteredImporter.js';
import M15FallbackImporter from './cardImporters/M15FallbackImporter.js';
import M15AdventureImporter from './cardImporters/M15AdventureImporter.js';
import M15SagaImporter from './cardImporters/M15SagaImporter.js';
import M15FullArtBasicLandImporter from './cardImporters/M15FullArtBasicLandImporter.js';
import M15EmblemImporter from './cardImporters/M15EmblemImporter.js';
import M20EmblemImporter from './cardImporters/M20EmblemImporter.js';

const cardImporters = [
    ClassicImporter,
    ClassicShiftedImporter,
    ClassicArtbgImporter,
    ClassicShiftedArtbgImporter,
    ClassicClearImporter,
    ClassicTokenImporter,
    ClassicSagaImporter,
    M15MainframeTokensImporter,
    M15EmblemImporter,
    M20EmblemImporter,
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
