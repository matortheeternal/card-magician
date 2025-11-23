export class FrameFolderRule {
    /**
     * @param {string} folder
     * @param {(card) => boolean} predicate
     */
    constructor(folder, predicate) {
        this.folder = folder;
        this.test = predicate;
    }
}

export const frameFolderRules = [
    new FrameFolderRule('saga', card => card.isSaga?.()),
    new FrameFolderRule('map', card => card.isMap?.()),
    new FrameFolderRule('dka', card => card.isDKA?.()),
    new FrameFolderRule('shifted', card => card.isShifted?.()),
    new FrameFolderRule('inverted', card => card.isInverted?.()),
    new FrameFolderRule('beyond', card => card.isBeyond?.()),
    new FrameFolderRule('fnm', card => card.isFNM?.()),
    new FrameFolderRule('snow', card => card.isSnow?.()),
    new FrameFolderRule('energy', card => card.isEnergyLand?.()),
    new FrameFolderRule('notched', card => {
        return card.isFrontDFC?.() && card.isTransform?.()
    }),
    new FrameFolderRule('front', card => card.isFrontDFC?.()),
    new FrameFolderRule('back',  card => card.isBackDFC?.()),
    new FrameFolderRule('devoid',  card => card.isDevoid?.()),
    new FrameFolderRule('normal', () => true),
];

export function getFrameFolder(card) {
    const rule = frameFolderRules.find(r => r.test(card));
    return rule.folder;
}
