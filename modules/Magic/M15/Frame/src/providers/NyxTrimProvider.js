import ColoredProvider from './ColoredProvider.js';

export default class NyxTrimProvider extends ColoredProvider {
    static enabled(card) {
        return card.isEnchantment?.();
    }

    get ext() {
        return '.png';
    }

    get maskFolder() {
        return 'mask/nyx';
    }

    get folder() {
        return 'element/nyx';
    }

    get isTrim() {
        return true;
    }
}
