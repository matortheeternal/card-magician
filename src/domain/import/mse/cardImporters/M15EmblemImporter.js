import M20EmblemImporter from './M20EmblemImporter.js';

export default class M15EmblemImporter extends M20EmblemImporter {
    static expectedVersion = '2026-09-06';
    static expectedStylesheet = 'm15-emblem';

    get mseFrames() {
        const framesValue = this.stylingData?.frame_type;
        return framesValue ? framesValue.split(', ') : [];
    }

    get template() {
        if (this.mseFrames.includes('m15'))
            return 'magic/M20/Emblem'; // TODO
        return 'magic/M20/Emblem';
    }
}
