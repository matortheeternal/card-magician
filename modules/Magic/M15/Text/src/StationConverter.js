export const stationCardExpr = /^([\s\S]+?)(\d+\+ \| [\s\S]+)$/;
const stationExpr = /(\d+\+) \| ([\s\S]+?)(?:(?=\d+\+ \| )|$)/g;

function parseStationLevels(str) {
    const levels = [];
    for (const [,range, content] of str.matchAll(stationExpr))
        levels.push({ range, content });
    return levels;
}

// 2 levels + base
// base: level-1
// index=0 level-2
// index=1 level-3
function generateStationsHTML(levels, convertParagraphs) {
    return levels.map((level, index) => (
        `<div class="station-level level-${index + 2}">
            <div class="station-circle">
                <div>${level.range}</div>
            </div>
            <div class="station-content">
                ${convertParagraphs(level.content)}
            </div>
        </div>`
    )).join('');
}

export const StationConverter = {
    match(str) {
        return str.match(stationCardExpr);
    },
    convert(match, { convertParagraphs }) {
        const startText = match[1];
        const levels = parseStationLevels(match[2]);
        return (
            `<div class="station-start level-1">
                ${convertParagraphs(startText)}
            </div>
            ${generateStationsHTML(levels, convertParagraphs)}`
        );
    }
};
