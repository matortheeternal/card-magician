import tokenConverters from './tokenConverters.js';

function makeCitation(content, options) {
    const cssClass = options.card?.citationStyle || 'italic';
    return `<cite class="${cssClass}">${content}</cite>`;
}

const ParagraphConverter = {
    match(str) {
        return str.match(/^([^\n]+)/);
    },
    convert(match, options) {
        const content = convertText(match[1], tokenConverters, options);
        const useQuoteTag = content.match(/^["“](.+?)["”]$/);
        const useCiteTag = content.match(/^(--|—)/);
        if (useCiteTag) return makeCitation(content, options);
        if (useQuoteTag) return `<q>“${useQuoteTag[1]}”</q>`;
        return `<p>${content}</p>`;
    }
};

function chomp(str, match) {
    const res = str.slice(match[0].length);
    const newlineMatch = res.match(/^\n+/);
    return newlineMatch ? res.slice(newlineMatch[0].length) : res;
}

function convertText(text, converters, options = {}) {
    let remainingStr = text;
    let result = '';

    function getConverter() {
        for (const converter of converters) {
            const match = converter.match(remainingStr, result, options);
            if (match) return [converter, match];
        }
        return [null, null];
    }

    while (remainingStr.length) {
        const [converter, match] = getConverter();
        if (!match) {
            const context = remainingStr.slice(0, 10);
            throw new Error(`Failed to convert ${context}`);
        }
        result += converter.convert(match, options);
        remainingStr = chomp(remainingStr, match);
    }
    return result;
}

/**
 * @typedef StructureConverter
 * @property {function(string): RegExpMatchArray | null} match
 * @property {function(RegExpMatchArray): string} convert
 */

/**
 * @typedef TextToHTMLOptions
 * @property {Array<StructureConverter>} structureConverters
 *   An ordered list of structural converters.
 *   Converters are checked in order: first match wins.
 * @property {Array} outputSymbols
 *   If provided, symbol objects encountered during token conversion
 *   are pushed into this array.
 */

/**
 * Converts MTG-style rules or flavor text into HTML paragraphs.
 *
 * Behavior:
 * - Input text is escaped.
 * - Then text is processed in two phases:
 *   1. Structural conversion, where the first matching structureConverter is applied.
 *   2. Token conversion (inline, left-to-right) using the global token converters.
 *
 * @param {string} text - Raw rules or flavor text.
 * @param {Object} card - The card object being rendered.
 * @param {TextToHTMLOptions} [options={}] - Optional configuration object.
 *
 * @returns {string} An HTML string.
 */
export default function textToHTML(text, card, {
    outputSymbols = [],
    structureConverters = []
} = {}) {
    if (!text || !text.length) return '';

    const convertParagraphs = str => {
        if (!str || !str.length) return '';
        const paragraphOptions = { state: {}, card, outputSymbols };
        return str.split(/\n+/).filter(Boolean).map(paragraph => {
            const match = ParagraphConverter.match(paragraph);
            if (!match) {
                const context = str.slice(0, 10);
                throw new Error(`Failed to convert paragraph ${context}`);
            }
            return ParagraphConverter.convert(match, paragraphOptions);
        }).join('\n');
    };

    const options = { state: {}, convertParagraphs, card, outputSymbols };
    const converters = [...structureConverters, ParagraphConverter];
    return convertText(text.trim(), converters, options);
}
