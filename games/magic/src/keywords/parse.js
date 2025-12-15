function parseNextKeywordToken(str) {
    const match = str.match(/<.*?>|[^<]*/);
    const token = match[0];

    if (!token.includes("<")) return [match, {format: "literal", variable: token, args: []}];

    let [variable, format, ...formatArgs] = token.substring(1, token.length - 1).split(":");
    if (!format) format = variable; // so we can have things like <number>

    return [match, {variable, format, formatArgs}];
}

export function parseKeywordTokens(str) {
    const res = [];
    let remainingStr = str;

    while (remainingStr.length) {
        const [match, token] = parseNextKeywordToken(remainingStr);
        res.push(token);
        remainingStr = remainingStr.slice(match[0].length);
    }

    return res;
}