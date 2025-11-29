import * as ManaScribe from './node_modules/mana-scribe/src/index.js';
import { buildColumns } from './src/columns.js';

export default class MagicTheGathering extends CardMagicianGame {
    async init() {
        this.ManaScribe = ManaScribe;
        this.setInfoHtml = await this.loadFile('setInfo.html');
        this.defaultSetSymbol = await this.loadFile('defaultSymbol.svg');
        this.collectorNumberOptions = [
            { id: 'four', name: '0001' },
            { id: 'threeOutOf', name: '001/999' },
        ];
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
        const info = {
            language: 'EN',
            setCode: '',
            symbol: this.defaultSetSymbol,
            collectorNumberFormat: this.collectorNumberOptions[0].id
        };
        return { cards: [], info };
    }

    renderSetInfo() {
        return this.setInfoHtml;
    }
}
