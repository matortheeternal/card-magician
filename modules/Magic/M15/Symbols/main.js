export default async function(card, utils) {
    const { symbolParsers } = await utils.import('symbolParsers.js');
    const { Symbol } = await utils.import('Symbol.js');

    const tallUrl = await utils.assetURL(`tall/circle.png`);
    const flatUrl = await utils.assetURL(`flat/circle.png`);
    card.tallManaCircleStyle = { backgroundImage: `url("${tallUrl}")` };
    card.flatManaCircleStyle = { backgroundImage: `url("${flatUrl}")` };

    const symbolExpr = /([1-9WUBRGwubrgTXYZ]+)([,:])/g;

    function findSymbolParser(str) {
        for (let parser of symbolParsers) {
            const match = parser.match(str);
            if (match) return [parser, match];
        }
        return str;
    }

    async function replaceAsync(str, regex, asyncFn) {
        const promises = [];
        str.replace(regex, (full, ...args) => {
            promises.push(asyncFn(full, ...args));
            return full;
        });
        const data = await Promise.all(promises);
        return str.replace(regex, () => data.shift());
    }

    card.parseSymbols = function(str) {
        let remainingStr = str;
        let output = [];
        while (remainingStr.length) {
            const [parser, match] = findSymbolParser(remainingStr);
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

    card.formatText = async function(text) {
        if (text.length === 0) return text;
        text = (await replaceAsync(text, symbolExpr, async (match, p1, p2) => {
            return await card.generateSymbols(p1) + p2;
        }));
        text = (await replaceAsync(text, /<sym>(\w+)<\/sym>/gi, async (match, p1) => {
            return await card.generateSymbols(p1);
        }));
        return text.replaceAll(/(LEGENDNAME|@)/g, () => {
            return card.getLegendName();
        }).replaceAll(/(CARDNAME|~)/g, () => {
            return card.cardName;
        });
    };
}
