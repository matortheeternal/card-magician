export default async function(card, utils) {
    const tallUrl = await utils.assetURL(`tall/mana_circle.png`);
    const flatUrl = await utils.assetURL(`flat/mana_circle.png`);
    card.tallManaCircleStyle = { backgroundImage: `url("${tallUrl}")` };
    card.flatManaCircleStyle = { backgroundImage: `url("${flatUrl}")` };

    const img = (src) => `<img class="sym" src="${src}"/>`;
    const tallManaCircle = (num) =>
        `<div class="mana-circle" :style="tallManaCircleStyle">${num}</div>`;
    const flatManaCircle = (num) =>
        `<div class="mana-circle" :style="flatManaCircleStyle">${num}</div>`;
    const symbolExpr = /([1-9WUBRGwubrgTXYZ]+)([,:])/g;

    async function symbolize(sym, size) {
        if ('qtxyz'.includes(sym))
            return img(await utils.assetURL(`${size}/mana_${sym}.png`));
        if ('0123456789'.includes(sym))
            return size === 'tall' ? tallManaCircle(sym) : flatManaCircle(sym);
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
