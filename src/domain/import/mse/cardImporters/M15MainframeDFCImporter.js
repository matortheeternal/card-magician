import M15AlteredImporter from './M15AlteredImporter.js';
import { hasPropertyValues } from '../cardPropertyImporters.js';

export default class M15MainframeDFCImporter extends M15AlteredImporter {
    static expectedVersion = '2024-09-06';
    static expectedStylesheet = 'm15-mainframe-dfc';

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

    getPropImporter(key) {
        return super.getPropImporter(
            key.endsWith('_2') ? key.slice(0, -2) : key
        );
    }

    getPropertyGroup([key]) {
        return key.endsWith('_2') ? 'back' : super.getPropertyGroup([key]);
    }

    async import() {
        const { base, front, back } = this.groupedProperties;
        await this.importProps(base, this.cmCard);
        this.cmCard.front.template = this.template;
        await this.importProps(front, this.cmCard.front);
        if (!hasPropertyValues(back)) return;
        this.cmCard.front.faceSymbol = 'auto';
        this.cmCard.back = { template: this.template, faceSymbol: 'auto' };
        await this.importProps(back, this.cmCard.back);
    }
}
