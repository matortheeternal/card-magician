import StructuredTextModule from '../StructuredText/main.js';

const chapters = [
    'I', 'II', 'III', 'IV', 'V', 'VI', 'VII',
    'VIII', 'IX', 'X', 'XI', 'XII', 'XIII'
];
const chGroup = `(?:${chapters.join('|')})`;
const chapterExpr = new RegExp(
    `^(${chGroup}(?:, ${chGroup})* [—-] )(.+)`,
    'i'
);

const ChapterConverter = {
    match(str) {
        return str.match(chapterExpr);
    },
    convert(match) {
        const activeChapters = match[1].slice(0, -3).split(', ');
        const icons = activeChapters.map(ch => (
            `<div class="chapter-icon-${ch.toUpperCase()}"></div>`
        ));
        return (
            `<div class="saga-chapter">
                 <div class="chapter-icons">${icons}</div>
                 <div class="chapter-content">${match[2]}</div>
            </div>`
        );
    }
};

export default class SagaText extends StructuredTextModule {
    get structureConverters() {
        return [ChapterConverter];
    }

    async styles() {
        const chapterIconStyles = chapters.map(ch => {
            const chImgUrl = this.resolveAsset(`chapters/${ch}.png`);
            return (
                `.saga-chapter .chapter-icon-${ch} {
                    background-image: url('${chImgUrl}');
                }`
            );
        }).join('\n');
        return [
            chapterIconStyles,
            await this.loadFile('style.css')
        ];
    }
}
