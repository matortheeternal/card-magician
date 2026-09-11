import M15AlteredImporter from './M15AlteredImporter.js';

const pageStyleMap = [
    'name and type',
    'name and type omen',
    'name and type flat',
    'name',
    'name omen',
    'name flat',
    'blank'
].reduce((obj, value) => ({
    ...obj,
    [value]: value.replaceAll(' ', '_')
}), {});

export default class M15AdventureImporter extends M15AlteredImporter {
    static expectedStylesheet = 'm15-adventure';
    static expectedVersion = '2026-09-06';

    get template() {
        return 'magic/M15/Adventure';
    }

    getPropertyGroup([key]) {
        return key.endsWith('_2') ? 'adventure' : super.getPropertyGroup([key]);
    }

    getPropImporter(key) {
        return super.getPropImporter(
            key.endsWith('_2') ? key.slice(0, -2) : key
        );
    }

    get isReversed() {
        return this.mseFrames.includes('Reversed');
    }

    get pageStyle() {
        const key = this.isReversed
            ? this.stylingData?.right_style
            : this.stylingData?.left_style;
        return pageStyleMap[key];
    }

    get frame() {
        if (this.isReversed) return 'reversed';
        if (this.mseFrames.includes('spotlight')) return 'spotlight';
        return 'normal';
    }

    async import() {
        this.cmCard.front.template = this.template;
        const { base, front, adventure } = this.groupedProperties;
        await this.importProps(base, this.cmCard);
        await this.importProps(front, this.cmCard.front);
        await this.importOptions(this.cmCard.front);
        this.cmCard.front.pageStyle = this.pageStyle;
        activeGame.addComputedProps(this.cmCard.front);

        const adventureFace = {};
        this.cmCard.front.adventure = adventureFace;
        await this.importProps(adventure, adventureFace);
        activeGame.addComputedProps(adventureFace);
    }
}
