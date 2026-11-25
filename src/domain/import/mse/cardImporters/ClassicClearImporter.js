import ClassicImporter from './ClassicImporter.js';

export default class ClassicClearImporter extends ClassicImporter {
    static expectedVersion = '2024-05-29';
    static expectedStylesheet = 'old-clear';

    get frame() {
        return 'clear';
    }

    get artSize() {
        if (this.stylingData?.border_visible === 'no') return 'borderless';
        return 'auto';
    }

    get frameOpacity() {
        const opacity = this.stylingData?.frame_opacity;
        return opacity ? Number(opacity) : '';
    }

    async importOptions(cmCardFace) {
        await super.importOptions(cmCardFace);
        cmCardFace.frameOpacity = this.frameOpacity;
    }
}
