function parseNextKeywordToken(str) {
    const match = str.match(/\s?<.*?>|[^<]*[^\s<]/);
    console.log(str, str.match(/\s<.*?>|[^<]+[^\s<]/))
    const token = match[0];

    if (!token.includes('<')) {
        return [
            match, 
            {format: 'literal', variable: token, args: []}
        ];
    }

    const tokenSplit = token.split('>')[0].split('<')[1].split(':');
    const [variable, _format, ...formatArgs] = tokenSplit;
    const format = _format ? _format : variable; // so we can have things like <number>

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