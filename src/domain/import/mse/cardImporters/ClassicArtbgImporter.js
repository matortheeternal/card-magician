import ClassicImporter from './ClassicImporter.js';

export default class ClassicArtbgImporter extends ClassicImporter {
    static expectedVersion = '2024-05-29';
    static expectedStylesheet = 'old-artbg';

    get artSize() {
        if (this.stylingData?.display_border === 'yes') return 'frameless';
        return 'borderless';
    }
}
