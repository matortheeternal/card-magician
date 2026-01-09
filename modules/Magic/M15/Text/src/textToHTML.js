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

    convert(str, converters, game) {
        let remainingStr = game.addAutoReminderText(str, this.card);
        let result = '';
        const state = {};
        while (remainingStr.length) {
            const [converter, match] = this.getNextConverter(remainingStr, result, state, converters);
            if (!converter || !match[0].length) return result;
            result += converter.convert(match, state, this.card, this.symbols);
            remainingStr = remainingStr.slice(match[0].length);
        }
        this.html += `<div class="t">${this.fixQuotes(result)}</div>`;
    }

    static parse(paragraph, card, converters, game) {
        const converter = new this(card);
        converter.convert(paragraph, converters, game);
        return converter;
    }

    getNextConverter(remainingStr, result, state, converters) {
        for (const converter of converters) {
            const match = converter.match(remainingStr, result, state);
            if (match) return [converter, match];
        }
        return [null, null];
    }
}

export default function textToHTML(text, card, converters, game) {
    if (!text || !text.length) return [];
    return text.split('\n').map(paragraph => {
        return ParagraphConverter.parse(paragraph, card, converters, game);
    });
}
