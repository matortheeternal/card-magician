import Symbol from './src/Symbol.js';
import symbolParsers from './src/symbolParsers.js';

export default class SymbolsModule extends CardMagicianModule {
    async init(card) {
        card.findSymbolParser = this.findSymbolParser.bind(this);
        card.parseSymbols = this.parseSymbols.bind(this);
        card.symbolsToHTML = this.symbolsToHTML.bind(this);
        card.generateSymbols = this.generateSymbols.bind(this);
    }

    findSymbolParser(str) {
        for (let parser of symbolParsers) {
            const match = parser.match(str);
            if (match) return [parser, match];
        }
        return [null, null];
    }

    parseSymbols(str) {
        let remainingStr = str;
        let output = [];
        while (remainingStr.length) {
            const [parser, match] = this.findSymbolParser(remainingStr);
            if (!parser) break;
            output.push(new Symbol(parser.name, match[0]));
            remainingStr = remainingStr.slice(match[0].length);
        }
        return output;
    }

    async symbolsToHTML(symbols, useTall = false) {
        const size = useTall ? 'tall' : 'flat';
        return (await Promise.all(
            symbols.map(async sym => {
                return sym.toHTML ? await sym.toHTML(this, size) : sym;
            })
        )).join('');
    }

    async generateSymbols(str, useTall) {
        if (!str) return '';
        const symbols = this.parseSymbols(str);
        return await this.symbolsToHTML(symbols, useTall);
    }
}
