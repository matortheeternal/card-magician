import ClassicImporter from './ClassicImporter.js';

export default class ClassicTokenImporter extends ClassicImporter {
    static expectedVersion = '2024-05-29';
    static expectedStylesheet = 'old-token';

    get template() {
        return 'magic/Classic/Token';
    }
}
