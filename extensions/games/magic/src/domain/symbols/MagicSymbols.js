import { ActivationCost } from 'mana-scribe';
import { symbolToHTML } from './symbolToHTML.js';

export default class MagicSymbols {
    constructor(game) {
        this.game = game;
    }

    initializeCardFace(face) {
        const methods = ['parseSymbols', 'symbolsToHTML', 'resolveColorSymbolIcon'];
        for (const name of methods) {
            Object.defineProperty(face, name, {
                value: this[name].bind(this),
                writable: true,
                configurable: true
            });
        }
    }

    parseSymbols(str, ordered = true) {
        const cost = ActivationCost.parse(str);
        return ordered ? cost.orderedSymbols : cost.symbols;
    }

    symbolsToHTML(symbols, useTall = false) {
        const size = useTall ? 'tall' : 'flat';
        return symbols.map(sym => symbolToHTML(this.game, sym, size)).join('');
    }

    resolveColorSymbolIcon(colorId) {
        if (colorId === 'm') return '/' + this.game.resolveAsset('multicolor.svg');
        return '/' + this.game.resolveAsset(`symbols/flat/single/${colorId}.png`);
    }
}
