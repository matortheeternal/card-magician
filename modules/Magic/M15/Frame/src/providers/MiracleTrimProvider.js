import ColoredProvider from './ColoredProvider.js';

export default class MiracleTrimProvider extends ColoredProvider {
    static enabled(card) {
        return card.isMiracle?.();
    }

    get maskFolder() {
        return 'mask/miracle';
    }

    get folder() {
        return 'element/miracle';
    }

    get subfolder() {
        if (this.card.isFNM?.()) return 'fnm';
        if (this.card.isInverted?.()) return 'inverted';
        if (this.card.isShifted?.()) return 'shifted';
        if (this.card.isBeyond?.()) return 'beyond';
        if (this.card.isSnow?.()) return 'snow';
        return 'normal';
    }

    async resolve(key) {
        return this.card.isClear?.() || this.card.clearTops?.()
            ? this.resolveAsset(`${this.folder}/normal/x.png`)
            : this.resolveAsset(`${this.folder}/${this.subfolder}/${key}.png`);
    }
}
