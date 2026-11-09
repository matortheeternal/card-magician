const WHITESPACE_PATTERN = /^\s+/;
const SYMBOL_RUN_PATTERN = /^([^ {]+)?((?:{[^{}]+})+)([^ {)]+)?/;
const ABILITY_WORD_PATTERN = /^((?:\w+ ){1,3})[-—] /;
const LEGEND_NAME_PATTERN = /^(LEGENDNAME|@)/;
const CARD_NAME_PATTERN = /^(CARDNAME|~)/;
const TEXT_RUN_PATTERN = /^[^\s{)*”<]+/;
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
        return str.match(WHITESPACE_PATTERN);
    },
    convert(match) {
        return match[0];
    }
};

export const UnderscoreConverter = {
    match(str) {
        return str.match(/^_/);
    },
    convert(match, { state }) {
        state.inEmphasis = !state.inEmphasis;
        return state.inEmphasis
            ? '<em>' + match[0].slice(1)
            : match[0].slice(1) + '</em>';
    }
};

export const AsteriskConverter = {
    match(str) {
        return str.match(/^\*/);
    },
    convert(match, { state }) {
        state.inStrong = !state.inStrong;
        return state.inStrong
            ? '<strong>' + match[0].slice(1)
            : match[0].slice(1) + '</strong>';
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
        return str.match(SYMBOL_RUN_PATTERN);
    },
    convert(match, { card, outputSymbols }) {
        const ordered = card.symbolOrder !== 'custom';
        const symbols = activeGame.parseSymbols(match[2], ordered);
        outputSymbols.push(...symbols);
        const content = (match[1] || '')
            + activeGame.symbolsToHTML(symbols)
            + (match[3] || '');
        return `<span class="symbol-block">${content}</span>`;
    }
};

export const AbilityWordConverter = {
    match(str) {
        return str.match(ABILITY_WORD_PATTERN);
    },
    convert(match) {
        return `<i>${match[1]}</i>— `;
    }
};

export const LegendNameConverter = {
    match(str) {
        return str.match(LEGEND_NAME_PATTERN);
    },
    convert(match, { card }) {
        return escapeHTML(card.getLegendName());
    }
};

export const CardNameConverter = {
    match(str) {
        return str.match(CARD_NAME_PATTERN);
    },
    convert(match, { card }) {
        return escapeHTML(card.name);
    }
};

export const FallbackConverter = {
    match(str) {
        return str.match(TEXT_RUN_PATTERN)
            || str.match(/^./);
    },
    convert(match) {
        return match[0];
    }
};

export default [
    WhitespaceConverter,
    UnderscoreConverter,
    AsteriskConverter,
    ParenthesisConverter,
    SymbolConverter,
    LegendNameConverter,
    CardNameConverter,
    AbilityWordConverter,
    FallbackConverter
];
