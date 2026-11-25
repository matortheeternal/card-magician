import M15AlteredImporter from './M15AlteredImporter.js';

export default class ClassicShiftedImporter extends M15AlteredImporter {
    static expectedVersion = '2024-05-29';
    static expectedStylesheet = 'classicshifted';

    get artSize() {
        if (this.stylingData?.image_size === 'extended') return 'extended';
        return 'standard';
    }

    get frame() {
        return 'shifted';
    }

    get template() {
        return 'magic/Classic/Main';
    }
}
