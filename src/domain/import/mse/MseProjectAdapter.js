import { parseMse } from './loadMseFile.js';

function asArray(value) {
    if (value === null || value === undefined) return [];
    return Array.isArray(value) ? value : [value];
}

export default class MseProjectAdapter {
    async setInfo() {
        if (this._setInfo) return this._setInfo;
        const data = parseMse(await this.rawSetText());
        data.card = await this.collectCards(data, new Set(['set']));
        this._setInfo = data;
        return data;
    }

    async collectCards(data, ancestors) {
        const cards = [...asArray(data.card)];
        for (const filename of asArray(data.include_file)) {
            if (ancestors.has(filename))
                throw new Error(`Circular MSE include: "${filename}"`);
            const included = parseMse(await this.entryText(filename));
            const nestedAncestors = new Set(ancestors).add(filename);
            cards.push(...await this.collectCards(included, nestedAncestors));
        }
        return cards;
    }

    async *card() {
        const data = await this.setInfo();
        for (const card of data.card)
            yield card;
    }
}
