import ColoredProvider from '../../Frame/src/providers/ColoredProvider.js';

export default class AdventureFrameProvider extends ColoredProvider {
    get ext() {
        if (this.card.frameFolder === 'spotlight') return '.png';
        return '.jpg';
    }

    get folder() {
        return '';
    }

    get maskFolder() {
        return '';
    }
}
