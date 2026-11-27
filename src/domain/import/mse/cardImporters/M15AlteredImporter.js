import BaseCardImporter from './BaseCardImporter.js';
import cardPropertyImporters from '../cardPropertyImporters.js';

const baseLevelKeys = ['notes'];

export default class M15AlteredImporter extends BaseCardImporter {
    static expectedStylesheet = 'm15-altered';
    static expectedVersion = '2026-09-06';

    get template() {
        return this.mseFrames.includes('map') ? 'magic/Spotlight/Map' : 'magic/M15/Main';
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
            await propImporter?.(value, cmCardFace, this.adapter);
        }
    }

    get mseFrames() {
        const framesValue = this.stylingData?.frames;
        return framesValue ? framesValue.split(', ') : [];
    }

    get frame() {
        if (this.mseFrames.includes('clear')) return 'clear';
        if (this.mseFrames.includes('devoid')) return 'devoid';
        if (this.mseFrames.includes('inverted')) return 'inverted';
        return 'auto';
    }

    get artSize() {
        if (this.mseFrames.includes('borderless art')) return 'borderless';
        if (this.mseFrames.includes('frameless art')) return 'frameless';
        return 'auto';
    }

    get chopTop() {
        const chopTop = this.stylingData?.chop_top;
        return chopTop?.length ? chopTop : '';
    }

    get chopBottom() {
        const chopBottom = this.stylingData?.chop_bottom;
        return chopBottom?.length ? chopBottom : '';
    }

    get centerText() {
        const centerText = this.stylingData?.center_text;
        if (centerText === 'short text only') return 'short';
        return centerText || 'never';
    }

    get commonSymbolStyle() {
        if (this.stylingData?.inverted_common_symbol === 'yes') return 'inverted';
        return 'standard';
    }

    async importOptions(cmCardFace) {
        cmCardFace.frame = this.frame;
        cmCardFace.artSize = this.artSize;
        cmCardFace.chopTop = this.chopTop;
        cmCardFace.chopBottom = this.chopBottom;
        cmCardFace.centerText = this.centerText;
        cmCardFace.commonSymbolStyle = this.commonSymbolStyle;
    }

    async import() {
        this.cmCard.front.template = this.template;
        const { base, front } = this.groupedProperties;
        await this.importProps(base, this.cmCard);
        await this.importProps(front, this.cmCard.front);
        await this.importOptions(this.cmCard.front);
        this.finalizeFace(this.cmCard.front);
    }
}
