export default class SymbolsModule extends CardMagicianModule {
    async init(card) {
        this.symbolParsers = await this.import('symbolParsers.js');
        this.Symbol = await this.import('Symbol.js');
        card.findSymbolParser = this.findSymbolParser.bind(this);
        card.parseSymbols = this.parseSymbols.bind(this);
        card.symbolsToHTML = this.symbolsToHTML.bind(this);
        card.generateSymbols = this.generateSymbols.bind(this);
    }

    findSymbolParser(str) {
        for (let parser of this.symbolParsers) {
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
            output.push(new this.Symbol(parser.name, match[0]));
            remainingStr = remainingStr.slice(match[0].length);
        }
        return output;
    }

    async symbolsToHTML(symbols, useTall) {
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
