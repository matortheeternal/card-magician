import { getConverters } from './converters.js';

function getConverter(remainingStr, result, state, game) {
    for (const converter of getConverters(game)) {
        const match = converter.match(remainingStr, result, state);
        if (match) return [converter, match];
    }
    return [null, null];
}

class ParagraphConverter {
    constructor(card) {
        this.symbols = [];
        this.card = card;
        this.html = '';
    }

    fixQuotes(str) {
        if (str.startsWith('“'))
            str = `<span class="q">“</span>` + str.slice(1);
        if (str.endsWith('”'))
            str = str.slice(0, -1) + `<span class="q">”</span>`;
        return str;
    }

    convert(str, game) {
        let remainingStr = game.addAutoReminderText(str, this.card);
        console.log("assdf", remainingStr);
        let result = '';
        const state = {};
        while (remainingStr.length) {
            const [converter, match] = getConverter(remainingStr, result, state, game);
            if (!converter || !match[0].length) return result;
            result += converter.convert(match, state, this.card, this.symbols);
            remainingStr = remainingStr.slice(match[0].length);
        }
        this.html += `<div class="t">${this.fixQuotes(result)}</div>`;
    }

    static parse(paragraph, card, game) {
        const converter = new this(card);
        converter.convert(paragraph, game);
        return converter;
    }
}

export default function textToHTML(text, card, game) {
    if (!text || !text.length) return [];
    return text.split('\n').map(paragraph => {
        return ParagraphConverter.parse(paragraph, card, game);
    });
}
