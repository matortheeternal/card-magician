import ClassicImporter from './ClassicImporter.js';

export default class ClassicSagaImporter extends ClassicImporter {
    static expectedVersion = '2026-09-06';
    static expectedStylesheet = 'old-saga';

    get template() {
        return 'magic/Classic/Saga';
    }
}
