import M15AlteredImporter from './M15AlteredImporter.js';

export default class M15FullArtBasicLandImporter extends M15AlteredImporter {
    static expectedVersion = '2026-09-06';
    static expectedStylesheet = 'm15-full-art-basic-land-symbol';

    get frame() {
        return 'basic';
    }

    get template() {
        return 'magic/M15/Land';
    }
}
