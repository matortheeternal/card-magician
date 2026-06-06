function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export const WhitespaceConverter = {
    match(str) {
        return str.match(/^\s+/);
    },
    convert(match) {
        return match[0];
    }
};

export const ParenthesisConverter = {
    match(str, res, { state }) {
        return state.inItalics
            ? str.match(/^\)/)
            : str.match(/^\(/);
    },
    convert(match, { state }) {
        state.inItalics = !state.inItalics;
        return state.inItalics
            ? '<i>' + match[0]
            : match[0] + '</i>';
    }
};

export const SymbolConverter = {
    match(str) {
        return str.match(/^([^ {]+)?((?:{[^{}]+})+)([^ {)]+)?/);
    },
    convert(match, { card, outputSymbols }) {
        const symbols = card.parseSymbols(match[2]);
        outputSymbols.push(...symbols);
        const content = (match[1] || '')
            + card.symbolsToHTML(symbols)
            + (match[3] || '');
        return `<span class="symbol-block">${content}</span>`;
    }
};

export const AbilityWordConverter = {
    match(str) {
        return str.match(/^((?:\w+ ){1,3})[-—] /);
    },
    convert(match) {
        return `<i>${match[1]}</i>— `;
    }
};

export const LegendNameConverter = {
    match(str) {
        return str.match(/^(LEGENDNAME|@)/);
    },
    convert(match, { card }) {
        return escapeHTML(card.getLegendName());
    }
};

export const CardNameConverter = {
    match(str) {
        return str.match(/^(CARDNAME|~)/);
    },
    convert(match, { card }) {
        return escapeHTML(card.name);
    }
};

export const FallbackConverter = {
    match(str) {
        return str.match(/^[^\s{)”<]+/)
            || str.match(/^./);
    },
    convert(match) {
        return match[0];
    }
};

export default [
    WhitespaceConverter,
    ParenthesisConverter,
    SymbolConverter,
    LegendNameConverter,
    CardNameConverter,
    AbilityWordConverter,
    FallbackConverter
];
