import BaseCardImporter from './BaseCardImporter.js';
import cardPropertyImporters from '../cardPropertyImporters.js';
import { getActiveGame } from '../../../game/gameManager.js';

const baseLevelKeys = ['notes'];

export default class M15AlteredImporter extends BaseCardImporter {
    static checkStylesheet(stylesheet, stylesheetVersion) {
        if (stylesheet !== 'm15-altered')
            return `Using m15-altered importer fallback for "${stylesheet}"`;
        if (stylesheetVersion === '2024-09-23') return;
        return `Using m15-altered importer for untested version "${stylesheetVersion}"`;
    }

    static match(mseCard, mseSet) {
        const stylesheet = mseCard.stylesheet || mseSet.stylesheet;
        const version = mseCard.stylesheet_version || mseSet.stylesheet_version;
        const warning = this.checkStylesheet(stylesheet, version);
        if (warning) log('import').warn(warning);
        return true;
    }

    get template() {
        return 'M15Main';
    }

    get properties() {
        return Object.entries(this.mseCard).filter(([,value]) => Boolean(value));
    }

    getPropertyGroup([key]) {
        return baseLevelKeys.includes(key) ? 'base' : 'front';
    }

    get groupedProperties() {
        return Object.groupBy(this.properties, this.getPropertyGroup);
    }

    getPropImporter(key) {
        return cardPropertyImporters[key];
    }

    async importProps(mseFaceEntries, cmCardFace) {
        if (!mseFaceEntries) return;
        for (const [key, value] of mseFaceEntries) {
            const propImporter = this.getPropImporter(key);
            await propImporter?.(value, cmCardFace, this.folderPath);
        }
    }

    async import() {
        const { base, front } = this.groupedProperties;
        await this.importProps(base, this.cmCard);
        await this.importProps(front, this.cmCard.front);
        getActiveGame().addComputedProps(this.cmCard.front);
    }
}
