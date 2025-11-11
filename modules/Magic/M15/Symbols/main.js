export default async function(card, utils) {
    const { symbolParsers } = await utils.import('symbolParsers.js');
    const { Symbol } = await utils.import('Symbol.js');

    const tallUrl = await utils.assetURL(`tall/circle.png`);
    const flatUrl = await utils.assetURL(`flat/circle.png`);
    card.tallManaCircleStyle = { backgroundImage: `url("${tallUrl}")` };
    card.flatManaCircleStyle = { backgroundImage: `url("${flatUrl}")` };

    function findSymbolParser(str) {
        for (let parser of symbolParsers) {
            const match = parser.match(str);
            if (match) return [parser, match];
        }
        return [null, null];
    }

    card.parseSymbols = function(str) {
        let remainingStr = str;
        let output = [];
        while (remainingStr.length) {
            const [parser, match] = findSymbolParser(remainingStr);
            if (!parser) break;
            output.push(new Symbol(parser.name, match[0]));
            remainingStr = remainingStr.slice(match[0].length);
        }
        return output;
    };

    card.symbolsToHTML = async function(symbols, useTall) {
        const size = useTall ? 'tall' : 'flat';
        return (await Promise.all(
            symbols.map(async sym => {
                return sym.toHTML ? await sym.toHTML(utils, size) : sym;
            })
        )).join('');
    };

    card.generateSymbols = async function(str, useTall) {
        if (!str) return '';
        const symbols = card.parseSymbols(str);
        return await card.symbolsToHTML(symbols, useTall);
    };
}
