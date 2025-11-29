import { buildColumns } from './columns.js';
import { autoNumberCards, formatCollectorNumber } from './collectorNumber.js'

export default class MagicTheGathering extends CardMagicianGame {
    async init() {
        this.setInfoHtml = await this.loadFile('setInfo.html');
        this.defaultSetSymbol = await this.loadFile('defaultSymbol.svg');
        this.autoNumberCards = autoNumberCards;
        this.formatCollectorNumber = formatCollectorNumber;
    }

    get columns () {
        return buildColumns();
    }

    get defaultTemplateId() {
        return 'M15Main';
    }

    loadSet(set) {
        const newSet = this.newSet();
        const info = { ...newSet.info, ...(set?.info ?? {}) };
        return { ...newSet, ...set, info };
    }

    newCard() {
        return { front: {} };
    }

    newSet() {
        const info = { language: 'EN', setCode: '', symbol: this.defaultSetSymbol, collectorNumberFormatting: 'four' };
        // const info = { language: 'EN', setCode: '', symbol: this.defaultSetSymbol };
        const collectorNumberOptions = [
            { id: 'four', label: '0001' },
            { id: 'threeOutOf', label: '001/999' },
        ];
        return { cards: [], info, collectorNumberOptions };
    }

    renderSetInfo() {
        return this.setInfoHtml;
    }
}
