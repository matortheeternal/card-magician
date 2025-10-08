export default async function(card, utils) {
    const { buildSymbolConverters } = await utils.import('symbolizer.js');

    const tallUrl = await utils.assetURL(`tall/circle.png`);
    const flatUrl = await utils.assetURL(`flat/circle.png`);
    card.tallManaCircleStyle = { backgroundImage: `url("${tallUrl}")` };
    card.flatManaCircleStyle = { backgroundImage: `url("${flatUrl}")` };

    const symbolExpr = /([1-9WUBRGwubrgTXYZ]+)([,:])/g;
    const symbolConverters = buildSymbolConverters(utils);

    function findSymbolConverter(str) {
        for (let converter of symbolConverters) {
            const match = converter.match(str);
            if (match) return [converter, match];
        }
        throw new Error('could not find matching symbol converter');
    }

    async function convertSymbols(str, size) {
        let remainingStr = str;
        let output = [];
        while (remainingStr.length) {
            const [converter, match] = findSymbolConverter(remainingStr);
            output.push(await converter.convert(size, match));
            remainingStr = remainingStr.slice(match[0].length);
        }
        return output.join('');
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

    card.generateSymbols = async function(str, useTall) {
        if (!str) return '';
        return convertSymbols(str, useTall ? 'tall' : 'flat');
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
