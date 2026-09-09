import { parseMse } from './loadMseFile.js';

export default class MseProjectAdapter {
    async setInfo() {
        return this._setInfo ||= parseMse(
            await this.rawSetText()
        );
    }

    async *card() {
        const data = await this.setInfo();
        for (const card of data.card)
            yield card;
    }
}
