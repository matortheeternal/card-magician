import LandFrame from './LandFrame.js';

export default class SnowLandFrame extends LandFrame {
    static matches(card) {
        return card.frame === 'snow';
    }

    get frameSubFolder() {
        return 'snow';
    }

    get frameId() {
        return 'snow';
    }
}
