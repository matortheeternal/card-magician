export default class BaseCardImporter {
    static expectedStylesheet = '';
    static expectedVersion = '';

    constructor(mseCard, cmCard, mseSet, folderPath) {
        this.mseCard = mseCard;
        this.mseSet = mseSet;
        this.cmCard = cmCard;
        this.folderPath = folderPath;
    }

    static checkStylesheet(stylesheetVersion) {
        if (stylesheetVersion === this.expectedVersion) return;
        return `Using ${this.expectedStylesheet} importer for untested `
            + `version "${stylesheetVersion}"`;
    }

    static match(mseCard, mseSet) {
        const stylesheet = mseCard.stylesheet || mseSet.stylesheet;
        const version = mseCard.stylesheet_version || mseSet.stylesheet_version;
        if (stylesheet !== this.expectedStylesheet) return false;
        const warning = this.checkStylesheet(version);
        if (warning) log('import').warn(warning);
        return true;
    }

    /**
     * @abstract
     * @returns {string}
     */
    get template() {
        throw new Error('Not implemented');
    }

    /**
     * @desc Returns styling data for the card.
     * @returns {object}
     */
    get stylingData() {
        return this.mseCard.has_styling === 'false'
            ? this.mseSet.styling?.[`magic-${this.mseCard.stylesheet}`]
            : this.mseCard.styling_data;
    }

    /**
     * @abstract
     * @param mseCard
     * @param cmCard
     */
    import(mseCard, cmCard) {
        throw new Error('Not implemented');
    }
}
