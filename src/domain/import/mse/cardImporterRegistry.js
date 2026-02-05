const cardImporters = new Set();

export function findMatchingImporter(mseSet, mseCard, cmCard, folderPath) {
    for (const CardImporter of cardImporters) {
        if (CardImporter.match(mseCard, mseSet))
            return new CardImporter(mseCard, cmCard, folderPath);
    }
}

export function registerCardImporter(CardImporter) {
    cardImporters.add(CardImporter);
}
