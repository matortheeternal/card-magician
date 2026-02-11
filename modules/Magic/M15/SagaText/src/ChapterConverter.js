export const chapters = [
    'I', 'II', 'III', 'IV', 'V', 'VI', 'VII',
    'VIII', 'IX', 'X', 'XI', 'XII', 'XIII'
];

const chGroup = `(?:${chapters.join('|')})`;

const chapterExpr = new RegExp(
    `^(${chGroup}(?:, ${chGroup})* [—-] )(.+)`,
    'i'
);

const allChaptersExpr = new RegExp(chapterExpr.source, 'mgi');

export function parseChapters(rulesText) {
    const chapters = [];
    for (const match of rulesText.matchAll(allChaptersExpr))
        chapters.push(...match[1].slice(0, -3).split(', '));
    return chapters;
}

export const ChapterConverter = {
    match(str) {
        return str.match(chapterExpr);
    },
    convert(match) {
        const activeChapters = match[1].slice(0, -3).split(', ');
        const icons = activeChapters.map(ch => (
            `<div class="chapter-icon-${ch.toUpperCase()}"></div>`
        ));
        return (
            `<div class="chapter-bar"></div>
            <div class="saga-chapter">
                 <div class="chapter-icons">${icons.join('')}</div>
                 <div class="chapter-content">
                    <div class="t">${match[2]}</div>
                </div>
            </div>`
        );
    }
};
