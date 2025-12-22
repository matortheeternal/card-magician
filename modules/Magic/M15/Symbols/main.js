import { symbolToHTML } from './src/symbolToHTML.js';

export default class SymbolsModule extends CardMagicianModule {
    async init(card) {
        const magic = this.getActiveGame();
        this.ActivationCost = magic.ManaScribe.ActivationCost;
        card.parseSymbols = this.parseSymbols.bind(this);
        card.symbolsToHTML = this.symbolsToHTML.bind(this);
    }

    parseSymbols(str) {
        const cost = this.ActivationCost.parse(str);
        return cost.symbols;
    }

    symbolsToHTML(symbols, useTall = false) {
        const size = useTall ? 'tall' : 'flat';
        return symbols.map(sym => symbolToHTML(this, sym, size)).join('');
    }

    generateSymbols(str, useTall) {
        if (!str) return '';
        const symbols = this.parseSymbols(str);
        return this.symbolsToHTML(symbols, useTall);
    }
}
