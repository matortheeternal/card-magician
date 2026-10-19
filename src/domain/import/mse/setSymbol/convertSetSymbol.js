import { parseMse } from '../loadMseFile.js';
import SvgBuilder from './SvgBuilder.js';
import Layer from './Layer.js';

function stripBom(text) {
    return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
}

function asArray(value) {
    return Array.isArray(value) ? value : [value];
}

/**
 * Converts raw .mse-symbol file text into set-icon SVG markup.
 *
 * @param {string} symbolText - raw text of the symbol file from the MSE set
 * @returns {string} svg markup for cmSet.symbol
 */
export default function convertSetSymbol(symbolText) {
    const sym = parseMse(stripBom(symbolText));
    if (!sym.part) throw new Error('Set symbol has no parts');
    const parts = asArray(sym.part);
    const svg = new SvgBuilder();

    let group;
    for (let i = parts.length - 1; i >= 0; i--) {
        const part = parts[i];
        if (!group || part.combine === 'overlap')
            group = svg.nextGroup();
        group.addLayer(new Layer(part, i));
    }

    return svg.toString();
}
