const rangeExpr = /(\d+\+|\d+-\d+)/;
const ptExpr = /(.+?\/.+?)/;
const contentExpr = /([\s\S]+?)/;
const greedyContentExpr = /([\s\S]+)/;

const getLevelExpr = (greedy = false) => {
    const levelParts = [
        rangeExpr,
        ptExpr,
        greedy ? greedyContentExpr : contentExpr
    ];
    const combinedSources = levelParts.map(p => p.source).join('\\s+');
    return `LEVEL ${combinedSources}`;
};

export const levelCardExpr = new RegExp(`^([\\s\\S]+?)(${getLevelExpr(true)})`);
const levelExpr = new RegExp(`${getLevelExpr()}(?:(?=LEVEL)|$)`, 'g');

export function parseLevels(str) {
    const levels = [];
    for (const [,range, pt, content] of str.matchAll(levelExpr))
        levels.push({ range, content, pt });
    return levels;
}

export function matchLevels(text = '') {
    return text.match(levelCardExpr);
}

export const stationCardExpr = /^([\s\S]+?)(\d+\+ \| [\s\S]+)$/;
const stationExpr = /(\d+\+) \| ([\s\S]+?)(?:(?=\d+\+ \| )|$)/g;

export function parseStationLevels(str) {
    const levels = [];
    for (const [,range, content] of str.matchAll(stationExpr))
        levels.push({ range, content });
    return levels;
}

export function matchStation(text = '') {
    return text.match(stationCardExpr);
}

export const listExpr = /^([-*] .+\n)*([-*] .+)/;
const listItemExpr = /^[-*] (.+)/gm;

export function parseList(str) {
    const items = [];
    for (const match of str.matchAll(listItemExpr))
        items.push(match[1]);
    return items;
}

export function matchChoices(text = '') {
    return text.match(listExpr);
}

