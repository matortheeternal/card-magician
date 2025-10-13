const converters = [{
    name: 'any hybrid symbol',
    match: str => str.match(/^.(\/.)+/),
    convert: () => 1
}, {
    name: 'numeric',
    match: str => str.match(/^[0-9]+/),
    convert: (match) => parseInt(match[0], 10)
}, {
    name: 'infinity',
    match: str => str.match(/^i/i),
    convert: () => Infinity
}, {
    name: 'specific mana',
    match: str => str.match(/^[wubrgchs]/i),
    convert: () => 1
}, {
    name: 'unrecognized symbol',
    match: str => str.match(/^./),
    convert: () => 0
}];

function findConverter(str) {
    for (let converter of converters) {
        const match = converter.match(str);
        if (match) return [converter, match];
    }
    throw new Error('Could not find converter for ' + str);
}

export function calculateCmc(costStr) {
    if (!costStr) return 0;
    let remainingStr = costStr;
    let cmc = 0;
    while (remainingStr.length) {
        const [converter, match] = findConverter(remainingStr);
        cmc += converter.convert(match);
        remainingStr = remainingStr.slice(match[0].length);
    }
    return cmc;
}
