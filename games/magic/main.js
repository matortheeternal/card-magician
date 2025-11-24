import { buildColumns } from './columns.js';

export default class MagicTheGathering extends CardMagicianGame {
    async init() {
        this.setInfoHtml = await this.loadFile('setInfo.html');
    }

    get columns () {
        return buildColumns();
    }

    get defaultTemplateId() {
        return 'M15Main';
    }

    newCard() {
        return { model: { front: {} } };
    }

    newSet() {
        return { cards: [], info: { language: 'EN', setCode: '' } };
    }

    renderSetInfo() {
        return this.setInfoHtml;
    }
}
