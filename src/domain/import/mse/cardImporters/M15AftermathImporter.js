import M15AlteredImporter from './M15AlteredImporter.js';

const BOTTOM_SUFFIX = '_2';

const propertyGroups = {
    notes: 'base',
    rarity: 'front',
    illustrator: 'front',
    border_color: 'front',
    rarity_2: 'ignored',
    illustrator_2: 'ignored'
};

export default class M15AftermathImporter extends M15AlteredImporter {
    static expectedStylesheet = 'm15-aftermath';
    static expectedVersion = '2024-05-27';

    get template() {
        return 'magic/M15/Aftermath';
    }

    getPropertyGroup([key]) {
        return propertyGroups[key] ?? (key.endsWith(BOTTOM_SUFFIX) ? 'bottom' : 'top');
    }

    getPropImporter(key) {
        return super.getPropImporter(
            key.endsWith(BOTTOM_SUFFIX) ? key.slice(0, -BOTTOM_SUFFIX.length) : key
        );
    }

    async importHalf(mseHalfEntries, centerTextKey) {
        const half = {};
        await this.importProps(mseHalfEntries, half);
        half.centerText = this.centerTextFrom(this.stylingData?.[centerTextKey]);
        this.finalizeFace(half);
        return half;
    }

    async import() {
        const face = this.cmCard.front;
        face.template = this.template;
        const { base, front, top, bottom } = this.groupedProperties;
        await this.importProps(base, this.cmCard);
        await this.importProps(front, face);
        face.commonSymbolStyle = this.commonSymbolStyle;
        face.top = await this.importHalf(top, 'center_text_1');
        face.bottom = await this.importHalf(bottom, 'center_text_2');
    }
}
