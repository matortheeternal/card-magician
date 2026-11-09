export const stationCardExpr = activeGame.textStructures.stationCardExpr;

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
        return activeGame.textStructures.matchStation(str);
    },
    convert(match, { convertParagraphs }) {
        const startText = match[1];
        const levels = activeGame.textStructures.parseStationLevels(match[2]);
        return (
            `<div class="station-start level-1">
                ${convertParagraphs(startText)}
            </div>
            ${generateStationsHTML(levels, convertParagraphs)}`
        );
    }
};
