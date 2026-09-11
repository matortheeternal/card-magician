import M15AlteredImporter from './M15AlteredImporter.js';

export default class M20EmblemImporter extends M15AlteredImporter {
    static expectedVersion = '2026-09-06';
    static expectedStylesheet = 'm20-emblems';

    get frame() {
        return null;
    }

    get template() {
        return 'magic/M20/Emblem';
    }

    async import() {
        await super.import();
        this.cmCard.front.rarity = 'emblem';
    }
}
