import M15AlteredImporter from './M15AlteredImporter.js';
import { combineLevelText } from '../cardPropertyImporters.js';

const chapters = ['I', 'II', 'III', 'IV', 'V', 'VI'];

export default class M15SagaImporter extends M15AlteredImporter {
    static expectedVersion = '2026-09-06';
    static expectedStylesheet = 'm15-saga';

    get template() {
        return 'magic/M15/Saga';
    }

    getChapters() {
        const chapterMappings = this.stylingData?.snap_chapter_to_box;
        if (!chapterMappings) return chapters.slice();
        return chapterMappings.split(',').reduce((a, v, chIndex) => {
            const index = Number(v) - 1;
            a[index] ||= [];
            if (chIndex < 6) a[index].push(chapters[chIndex]);
            return a;
        }, []).map(a => a.join(', '));
    }

    async importProps(mseFaceEntries, cmCardFace) {
        await super.importProps(mseFaceEntries, cmCardFace);
        const chapters = this.getChapters();
        cmCardFace.rulesText = combineLevelText(this.mseCard).map(
            (entry, index) => `${chapters[index]} - ${entry}`
        ).join('\n\n');
    }
}
