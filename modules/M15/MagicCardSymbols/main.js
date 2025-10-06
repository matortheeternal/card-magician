export default async function(card, utils) {
    const img = (src) => `<img src="${src}"/>`;
    const symbolExpr = /([1-9WUBRGwubrgTXYZ]+)([,:])/g;

    async function symbolize(sym, size) {
        if ('qtxyz'.includes(sym))
            return img(await utils.assetURL(`${size}/mana_${sym}.png`));
        if ('0123456789'.includes(sym))
            return img(await utils.assetURL(`${size}/${sym}.png`));
        if ('wubrgc'.includes(sym))
            return img(await utils.assetURL(`${size}/mana_${sym}.png`));
        return sym;
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
        const size = useTall ? 'tall' : 'flat';
        return (await Promise.all(
            str.toLowerCase().split('').map(sym => symbolize(sym, size))
        )).join('');
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
