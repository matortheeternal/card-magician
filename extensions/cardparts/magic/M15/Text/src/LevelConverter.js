export const levelCardExpr = activeGame.textStructures.levelCardExpr;

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
        return activeGame.textStructures.matchLevels(str);
    },
    convert(match, { convertParagraphs }) {
        const startText = match[1];
        const levels = activeGame.textStructures.parseLevels(match[2]);
        return (
            `<auto-fit-text class="level-start" max="16">
                ${convertParagraphs(startText)}
            </auto-fit-text>
            ${generateLevelsHTML(levels, convertParagraphs)}`
        );
    }
};
