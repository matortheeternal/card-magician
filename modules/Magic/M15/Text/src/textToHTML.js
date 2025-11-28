const textTransformers = [
    // {
    //     match: str => str.match(/([0-9wubrgtxyz]+)([,:])/i),
    //     apply: async (card, match) => {
    //         return await card.generateSymbols(match[1]) + match[2];
    //     }
    // },
    {
        match: str => str.match(/<sym>(.+?)<\/sym>/i)
                   || str.match(/{(.+?)}/),
        apply: async (card, match, outputSymbols) => {
            const symbols = card.parseSymbols(match[1]);
            outputSymbols.push(...symbols);
            return await card.symbolsToHTML(symbols);
        }
    },
    {
        match: str => str.match(/(LEGENDNAME|@)/),
        apply: async (card) => card.getLegendName()
    },
    {
        match: str => str.match(/(CARDNAME|~)/),
        apply: async (card) => card.name
    }
];

function getTextTransformer(token) {
    for (let transformer of textTransformers) {
        const match = transformer.match(token);
        if (match) return [transformer, match];
    }
    return [null, null];
}

async function convertToken(token, card, symbols) {
    const [transformer, match] = getTextTransformer(token);
    return transformer
        ? token.replace(match[0], await transformer.apply(card, match, symbols))
        : token;
}

function fixQuotes(html) {
    if (html.startsWith('“'))
        html = `<span class="q">“</span>${html.slice(1)}`;
    if (html.endsWith('”'))
        html = `${html.slice(0, -1)}<span class="q">”</span>`;
    return html;
}

async function convertContent(content, card, symbols) {
    const tokens = content.split(' ');
    const result = [];
    for (let token of tokens)
        result.push(await convertToken(token, card, symbols));
    return fixQuotes(result.join(' '));
}

export default async function textToHTML(text, card, symbols = []) {
    if (!text || !text.length) return '';
    const paragraphs = [];
    for (const content of text.split('\n')) {
        const html = await convertContent(content, card, symbols);
        paragraphs.push(`<div class="t">${html}</div>`);
    }

    return paragraphs.join('\n');
}
