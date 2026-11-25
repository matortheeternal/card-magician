import ClassicShiftedImporter from './ClassicShiftedImporter.js';

export default class ClassicShiftedArtbgImporter extends ClassicShiftedImporter {
    static expectedVersion = '2024-05-29';
    static expectedStylesheet = 'classicshifted-artbg';

    get artSize() {
        if (this.stylingData?.display_border === 'yes') return 'frameless';
        return 'borderless';
    }
}
