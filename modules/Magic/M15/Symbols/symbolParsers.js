function getHybridCount(str) {
    return new Set(str.split('/')).size;
}

function hybridMatcher(expr, hybridCount) {
    return str => {
        const match = str.match(expr);
        if (!match || getHybridCount(match[0]) !== hybridCount) return;
        return match;
    };
}

export const symbolParsers = [
    {
        name: 'phyrexian color',
        match: str => str.match(/^(h\/[wubrgh]|[wubrg]\/h)/i)
    },
    {
        name: 'generic/split',
        match: str => str.match(/^[2]\/([wubrgc])/i)
    },
    {
        name: '5-color hybrid',
        match: hybridMatcher(/^[wubrg](\/[wubrg]){4}/i, 4)
    },
    {
        name: '3-color hybrid',
        match: hybridMatcher(/^[wubrg](\/[wubrg]){2}/i, 3)
    },
    {
        name: '2-color hybrid',
        match: hybridMatcher(/^[wubrg]\/[wubrg]/i, 2)
    },
    {
        name: 'half color',
        match: str => str.match(/^\|[wubrgs]/i)
    },
    {
        name: 'two+ digit number',
        match: str => str.match(/^(100|99|30|[1-2][0-9])/i)
    },
    {
        name: 'circle with text',
        match: str => str.match(/^[0-9|\/flxyz]/i)
    },
    {
        name: 'single',
        match: str => str.match(/^[wubrgchsei]/i)
    },
    {
        name: 'tap',
        match: str => str.match(/^[tq]/i)
    }
];
