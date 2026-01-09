export const WhitespaceConverter = {
    match(str) {
        return str.match(/^\s+/);
    },
    convert(match) {
        return match[0];
    }
};

export const ParenthesisConverter = {
    match(str, res, state) {
        return state.inItalics
            ? str.match(/^\)/)
            : str.match(/^\(/);
    },
    convert(match, state) {
        state.inItalics = !state.inItalics;
        return state.inItalics
            ? '<i>' + match[0]
            : match[0] + '</i>';
    }
};

export const SymbolConverter = {
    match(str) {
        return str.match(/^{(.+?)}/)
            || str.match(/^<sym>(.+?)<\/sym>/i);
    },
    convert(match, state, card, outputSymbols) {
        const symbols = card.parseSymbols(match[1]);
        outputSymbols.push(...symbols);
        return card.symbolsToHTML(symbols);
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

export function getConverters(game) { 
    return [
        ...game.AutoReplaceConverters,
        WhitespaceConverter,
        ParenthesisConverter,
        SymbolConverter,
        FallbackConverter
    ];
}