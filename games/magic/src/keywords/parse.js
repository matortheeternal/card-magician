export function parseKeywordExpression(str) {
    const res = [];
    let remainingStr = str;

    while (remainingStr.length) {
        const [match, token] = parseNextKeywordToken(remainingStr);
        res.push(token);
        remainingStr = remainingStr.slice(match[0].length);
    }

    return res;
}

function parseNextKeywordToken(str) {
    const match = str.match(/^<.*?>|^[^<]*/);
    const token = match[0];

    if (!token.includes("<")) return [match, {variable: "literal", format: token, args: []}];

    let [variable, format, ...formatArgs] = token.substring(1, -1).split(":");
    if (!format) format = variable; // so we can have things like <number>

    return [match, {variable, format, formatArgs}];
}