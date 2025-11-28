import ColoredProvider from './ColoredProvider.js';

export default class FrameProvider extends ColoredProvider {
    get folder() {
        return `frame/${this.card.frameFolder}`;
    }

    get maskFolder() {
        if (this.card.isEnergyLand?.()) return 'mask/energy';
        if (this.card.isDKA?.()) return 'mask/dka';
        return 'mask/normal';
    }

    get hasLandTemplates() {
        return this.card.frameFolder !== 'energy';
    }
}
