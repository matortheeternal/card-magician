import M15AlteredImporter from './M15AlteredImporter.js';

export default class M15MainframeDFCImporter extends M15AlteredImporter {
    static expectedVersion = '2024-09-06';
    static expectedStylesheet = 'm15-mainframe-dfc';

    getPropImporter(key) {
        return super.getPropImporter(
            key.endsWith('_2') ? key.slice(0, -2) : key
        );
    }

    getPropertyGroup([key]) {
        return key.endsWith('_2') ? 'back' : super.getPropertyGroup([key]);
    }

    async import() {
        await super.import();
        const { back } = this.groupedProperties;
        this.cmCard.front.faceSymbol = 'autodetect';
        this.cmCard.back = { template: this.template, faceSymbol: 'autodetect' };
        await this.importProps(back, this.cmCard.back);
        await this.importOptions(this.cmCard.back);
        activeGame.addComputedProps(this.cmCard.back);
    }
}
