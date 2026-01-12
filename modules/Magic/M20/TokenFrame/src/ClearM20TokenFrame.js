import M20TokenFrame from './M20TokenFrame.js';

export default class ClearM20TokenFrame extends M20TokenFrame {
    static matches(card) {
        return card.frame === 'clear';
    }

    coloredBlend(folder) {
        return `${folder}/x.png`;
    }

    get artDimensions() {
        return { width: 343, height: 471 };
    }

    /* --- FRAME --- */
    get frameId() {
        return 'token-clear';
    }
}
