import { KeywordConverter, getPsuedoKeywordConverters } from "./keywords.js";

export const WhitespaceConverter = {
    match(str) {
        return str.match(/^\s+/);
    },
    convert(match) {
        return match[0];
    }
}

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
}

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
}

export const LegendNameConverter = {
    match(str) {
        return str.match(/^(LEGENDNAME|@)/)
    },
    convert(match, state, card) {
        return card.getLegendName();
    }
}

export const CardNameConverter = {
    match(str) {
        return str.match(/^(CARDNAME|~)/)
    },
    convert(match, state, card) {
        return card.name;
    }
}

export const FallbackConverter = {
    match(str) {
        return str.match(/^[^\s{)”<]+/)
            || str.match(/^./);
    },
    convert(match) {
        return match[0];
    }
}

export const converters = [
    // ...getKeywordConverters(),
    ...getPsuedoKeywordConverters(),
    WhitespaceConverter,
    ParenthesisConverter,
    SymbolConverter,
    LegendNameConverter,
    CardNameConverter,
    KeywordConverter,
    FallbackConverter
];
