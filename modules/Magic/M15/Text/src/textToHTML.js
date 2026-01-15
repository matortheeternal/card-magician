import { converters } from './converters.js';

function getConverter(remainingStr, result, state) {
    for (const converter of converters) {
        const match = converter.match(remainingStr, result, state);
        if (match) return [converter, match];
    }
    return [null, null];
}

// matches any text, wrapping leading and trailing quotes in span.q if found
// span.q is used to fix quote character width
const QuoteConverter = {
    match(str) {
        return str.match(/.+/);
    },
    convert(match) {
        const result = match[0]
            .replace(/^[“"]/, `<span class="q">“</span>`)
            .replace(/["”]$/, `<span class="q">”</span>`);
        return `<div class="t">${result}</div>`;
    }
};

class ParagraphConverter {
    constructor(card, options) {
        this.symbols = options.outputSymbols;
        this.structureConverters = [
            ...(options.structureConverters || []),
            QuoteConverter
        ];
        this.card = card;
        this.html = '';
    }

    convert(str) {
        let remainingStr = str;
        let result = '';
        const state = {};
        while (remainingStr.length) {
            const [converter, match] = getConverter(remainingStr, result, state);
            if (!converter || !match[0].length) return result;
            result += converter.convert(match, state, this.card, this.symbols);
            remainingStr = remainingStr.slice(match[0].length);
        }
        for (const converter of this.structureConverters) {
            const match = converter.match(result);
            if (!match) continue;
            this.html += converter.convert(match);
            break;
        }
    }

    static parse(paragraph, card, options) {
        const converter = new this(card, options);
        converter.convert(paragraph);
        return converter;
    }
}

/**
 * @typedef StructureConverter
 * @property {function(string): RegExpMatchArray | null} match
 * @property {function(RegExpMatchArray): string} convert
 */

/**
 * @typedef TextToHTMLOptions
 * @property {Array<StructureConverter>} structureConverters
 *   Ordered list of paragraph-level converters.
 *   Converters are checked in order; the first match wins.
 * @property {Array} outputSymbols
 *   If provided, symbol objects encountered during token conversion
 *   are pushed into this array.
 */

/**
 * Converts MTG-style rules or flavor text into HTML paragraphs.
 *
 * Behavior:
 * - Input text is assumed to be sanitized HTML.
 * - Text is split into paragraphs on newline boundaries.
 * - Each paragraph is processed in two phases:
 *   1. Token conversion (inline, left-to-right) using the global token converters.
 *   2. Structural conversion (paragraph-level), where the first matching
 *      structureConverter is applied.
 * - A base structural converter which handles leading and trailing quotes is always
 *   provided by default.
 *
 * @param {string} text
 *   Raw rules or flavor text. Newlines delimit paragraphs.
 *
 * @param {Object} card
 *   The card object being rendered. Passed through to converters.
 *
 * @param {TextToHTMLOptions} [options={}]
 *   Optional configuration object.
 *
 * @returns {Array<{ html: string }>}
 *   An array of paragraph objects. Each object contains a single `html` field.
 */
export default function textToHTML(text, card, options = {}) {
    if (!text || !text.length) return [];
    return text.split(/\n+/).map(paragraph => {
        return ParagraphConverter.parse(paragraph, card, options);
    });
}
