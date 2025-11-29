import ColoredProvider from './ColoredProvider.js';

export default class FrameProvider extends ColoredProvider {
    get ext() {
        if (this.card.frameFolder === 'devoid') return '.png';
        return '.jpg';
    }

    get folder() {
        return `frame/${this.card.frameFolder}`;
    }

    get maskFolder() {
        if (this.card.isEnergyLand?.()) return 'mask/energy';
        if (this.card.isDKA?.()) return 'mask/dka';
        return 'mask/normal';
    }

    get hasLandTemplates() {
        return this.card.frameFolder !== 'energy'
            && this.card.frameFolder !== 'devoid';
    }
}
