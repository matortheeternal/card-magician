import M15AlteredImporter from './M15AlteredImporter.js';

export default class M15FallbackImporter extends M15AlteredImporter {
    static match(mseCard, mseSet) {
        const stylesheet = mseCard.stylesheet || mseSet.stylesheet;
        log('import').warn(`Using fallback importer for "${stylesheet}"`);
        return true;
    }
}
