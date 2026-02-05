import M15AlteredImporter from './M15AlteredImporter.js';
import { registerCardImporter } from '../cardImporterRegistry.js';

export default class M15MainframeDFCImporter extends M15AlteredImporter {
    static expectedVersion = '2024-09-06';
    static expectedStylesheet = 'm15-mainframe-dfc';
    static template = 'M15Main';

    static checkStylesheet(stylesheetVersion) {
        if (stylesheetVersion === this.expectedVersion) return;
        return `Using m15-mainframe-dfc importer for untested `
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

    getPropertyGroup([key]) {
        return key.endsWith('_2') ? 'back' : super.getPropertyGroup([key]);
    }

    async import() {
        const { base, front, back } = this.groupedProperties;
        await this.importProps(base, this.cmCard);
        this.cmCard.front.template = this.constructor.template;
        await this.importProps(front, this.cmCard.front);
        if (!back.length) return;
        this.cmCard.back = { template: this.constructor.template };
        await this.importProps(
            back.map(([key, value]) => [key.slice(0, -2), value]),
            this.cmCard.back
        );
    }
}

registerCardImporter(M15MainframeDFCImporter);
