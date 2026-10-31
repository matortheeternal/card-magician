import { symbolToHTML } from './src/symbolToHTML.js';

export default class SymbolsModule extends CardMagicianModule {
    async init(card) {
        this.ActivationCost = activeGame.ManaScribe.ActivationCost;
        card.parseSymbols = this.parseSymbols.bind(this);
        card.symbolsToHTML = this.symbolsToHTML.bind(this);
    }

    parseSymbols(str, ordered = true) {
        const cost = this.ActivationCost.parse(str);
        return ordered ? cost.orderedSymbols : cost.symbols;
    }

    symbolsToHTML(symbols, useTall = false) {
        const size = useTall ? 'tall' : 'flat';
        return symbols.map(sym => symbolToHTML(this, sym, size)).join('');
    }
}
