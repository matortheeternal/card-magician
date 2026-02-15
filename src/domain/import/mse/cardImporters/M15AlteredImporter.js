import BaseCardImporter from './BaseCardImporter.js';
import cardPropertyImporters from '../cardPropertyImporters.js';
import { getActiveGame } from '../../../game/gameManager.js';

const baseLevelKeys = ['notes'];

export default class M15AlteredImporter extends BaseCardImporter {
    static expectedStylesheet = 'm15-altered';
    static expectedVersion = '2024-09-23';

    get template() {
        return this.mseFrames.includes('map') ? 'M15Map' : 'M15Main';
    }

    getPropertyGroup([key]) {
        return baseLevelKeys.includes(key) ? 'base' : 'front';
    }

    get properties() {
        return Object.entries(this.mseCard).filter(([,value]) => Boolean(value));
    }

    get groupedProperties() {
        return this._groupedProperties ??= Object.groupBy(
            this.properties, this.getPropertyGroup
        );
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

    get mseFrames() {
        const framesValue = this.stylingData?.frames;
        return framesValue ? framesValue.split(', ') : [];
    }

    get frame() {
        if (this.mseFrames.includes('clear')) return 'clear';
        if (this.mseFrames.includes('devoid')) return 'devoid';
        return '';
    }

    get chopTop() {
        const chopTop = this.stylingData?.chop_top;
        return chopTop?.length ? chopTop : '';
    }

    get chopBottom() {
        const chopBottom = this.stylingData?.chop_bottom;
        return chopBottom?.length ? chopBottom : '';
    }

    async importOptions(cmCardFace) {
        cmCardFace.frame = this.frame;
        cmCardFace.chopTop = this.chopTop;
        cmCardFace.chopBottom = this.chopBottom;
    }

    async import() {
        this.cmCard.front.template = this.template;
        const { base, front } = this.groupedProperties;
        await this.importProps(base, this.cmCard);
        await this.importProps(front, this.cmCard.front);
        await this.importOptions(this.cmCard.front);
        getActiveGame().addComputedProps(this.cmCard.front);
    }
}
