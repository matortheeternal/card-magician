import ColoredProvider from './ColoredProvider.js';

export default class SnowTrimProvider extends ColoredProvider {
    static enabled(card) {
        return card.isSnow?.();
    }

    get ext() {
        return '.png';
    }

    get isTrim() {
        return true;
    }

    get hasLandTemplates() {
        return true;
    }

    get maskFolder() {
        return 'mask/snow';
    }

    get folder() {
        return 'element/snow';
    }
}
