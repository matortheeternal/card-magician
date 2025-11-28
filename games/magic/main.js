import { buildColumns } from './columns.js';
import { autoNumber } from './collectorNumber.js';

export default class MagicTheGathering extends CardMagicianGame {
    async init() {
        this.setInfoHtml = await this.loadFile('setInfo.html');
        this.defaultSetSymbol = await this.loadFile('defaultSymbol.svg');
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
        const info = { language: 'EN', setCode: '', symbol: this.defaultSetSymbol };
        return { cards: [], info };
    }

    renderSetInfo() {
        return this.setInfoHtml;
    }
}
