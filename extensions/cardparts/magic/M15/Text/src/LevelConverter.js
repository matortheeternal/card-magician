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

function parseLevels(str) {
    const levels = [];
    for (const [,range, pt, content] of str.matchAll(levelExpr))
        levels.push({ range, content, pt });
    return levels;
}

function generateLevelsHTML(levels, convertParagraphs) {
    return levels.map((level, index) => (
        `<div class="creature-level level-${index + 1}">
            <div class="level-arrow">
                <div>LEVEL</div>
                <div>${level.range}</div>
            </div>
            <div class="level-content">
                ${convertParagraphs(level.content)}
            </div>
            <div class="level-stats">
                <div class="pt-text">${level.pt}</div>
            </div>
        </div>`
    )).join('');
}

export const LevelConverter = {
    match(str) {
        return str.match(levelCardExpr);
    },
    convert(match, { convertParagraphs }) {
        const startText = match[1];
        const levels = parseLevels(match[2]);
        return (
            `<auto-fit-text class="level-start" max="16">
                ${convertParagraphs(startText)}
            </auto-fit-text>
            ${generateLevelsHTML(levels, convertParagraphs)}`
        );
    }
};
