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

export default class FrameFolderRegistry {
    rules = [
        new FrameFolderRule('saga', card => card.isSaga?.()),
        new FrameFolderRule('dka', card => card.isDKA?.()),
        new FrameFolderRule('shifted', card => card.isShifted?.()),
        new FrameFolderRule('inverted', card => card.isInverted?.()),
        new FrameFolderRule('beyond', card => card.isBeyond?.()),
        new FrameFolderRule('fnm', card => card.isFNM?.()),
        new FrameFolderRule('snow', card => card.isSnow?.()),
        new FrameFolderRule('energy', card => card.isEnergyLand?.()),
        new FrameFolderRule('notched', card => {
            return card.isFrontDFC?.() && card.isTransform?.();
        }),
        new FrameFolderRule('front', card => {
            return Boolean(card.faceSymbol) && card.id === 'front';
        }),
        new FrameFolderRule('back',  card => card.isBackDFC?.()),
        new FrameFolderRule('devoid',  card => card.isDevoid?.()),
        new FrameFolderRule('normal', () => true),
    ];

    resolveFolder(card) {
        const rule = this.rules.find(r => r.test(card));
        return rule.folder;
    }
}
