import M15AlteredImporter from './M15AlteredImporter.js';
import { getActiveGame } from '../../../game/gameManager.js';

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
        const props = await super.import();
        this.cmCard.front.faceSymbol = 'auto';
        this.cmCard.back = { template: this.template, faceSymbol: 'auto' };
        await this.importProps(props.back, this.cmCard.back);
        await this.importOptions(this.cmCard.back);
        getActiveGame().addComputedProps(this.cmCard.back);
        return props;
    }
}
