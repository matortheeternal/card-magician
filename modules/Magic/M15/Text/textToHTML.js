const textTransformers = [
    // {
    //     match: str => str.match(/([0-9wubrgtxyz]+)([,:])/i),
    //     apply: async (card, match) => {
    //         return await card.generateSymbols(match[1]) + match[2];
    //     }
    // },
    {
        match: str => str.match(/<sym>([^<]+)<\/sym>/i),
        apply: async (card, match) => {
            return await card.generateSymbols(match[1]);
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

async function convertToken(token, card) {
    const [transformer, match] = getTextTransformer(token);
    return transformer
        ? await transformer.apply(card, match) + token.slice(match[0].length)
        : token;
}

async function convertContent(content, card) {
    const tokens = content.split(' ');
    let result = [];
    for (let token of tokens)
        result.push(await convertToken(token, card));

    return result.join(' ');
}

export async function textToHTML(text, card) {
    if (!text || !text.length) return '';
    const paragraphs = [];
    for (const content of text.split('\n')) {
        let className = 't';
        if (content.startsWith('“')) className += ' q';
        const html = await convertContent(content, card);
        paragraphs.push(`<div class="${className}">${html}</div>`);
    }

    return paragraphs.join('\n');
}
