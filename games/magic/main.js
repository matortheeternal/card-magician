import * as ManaScribe from './node_modules/mana-scribe/src/index.js';
import { buildColumns } from './src/columns.js';

export default class MagicTheGathering extends CardMagicianGame {
    async init() {
        this.ManaScribe = ManaScribe;
        this.setInfoHtml = await this.loadFile('setInfo.html');
        this.defaultSetSymbol = await this.loadFile('defaultSymbol.svg');
    }

    get columns () {
        return buildColumns(this.ManaScribe);
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
