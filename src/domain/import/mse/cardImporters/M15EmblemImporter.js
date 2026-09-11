import M15AlteredImporter from './M15AlteredImporter.js';

export default class M15EmblemImporter extends M15AlteredImporter {
    static expectedVersion = '2026-09-06';
    static expectedStylesheet = 'm15-emblem';

    get frame() {
        return null;
    }

    get template() {
        return 'magic/M20/Emblem';
    }
}
