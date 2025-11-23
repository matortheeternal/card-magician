import ColoredProvider from './ColoredProvider.js';

export default class CrownProvider extends ColoredProvider {
    static enabled(card) {
        return card.isLegendary?.();
    }

    get maskFolder() {
        return 'mask/crown';
    }

    get folder() {
        return 'element/crown';
    }

    get subfolder() {
        if (this.card.isEnchantment?.()) return 'nyx';
        if (this.card.isBorderless?.()) return 'borderless';
        if (this.card.isBrawl?.())
            return this.card.hasFaceSymbol?.()
                ? 'brawl_with_face_symbol'
                : 'brawl';
        if (this.card.isCompanion?.()) return 'companion';
        return 'normal';
    }

    async resolve(key) {
        const path = `${this.folder}/${this.subfolder}/${key}.png`;
        return this.resolveAsset(path);
    }
}
