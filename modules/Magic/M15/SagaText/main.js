import StructuredTextModule from '../StructuredText/main.js';
import romanToInt from './src/romanToInt.js';
import { ChapterConverter, parseChapters, chapters } from './src/ChapterConverter.js';

export default class SagaText extends StructuredTextModule {
    get structureConverters() {
        return [ChapterConverter];
    }

    get maxChapter() {
        const chapters = parseChapters(this.card.rulesText);
        const maxChapter = chapters.reduce((max, chapter) => {
            const currentValue = romanToInt(chapter);
            return currentValue > (max?.value || 0)
                ? { chapter, value: currentValue }
                : max;
        });
        return maxChapter.chapter;
    }

    get defaultPreText() {
        return '(As this Saga enters and after your draw step, add a lore counter. '
             + `Sacrifice after ${this.maxChapter}.)`;
    }

    get chapterBarStyle() {
        return (
            `.chapter-bar {
                background-image: url("${this.resolveAsset('bar.png')}");
            }`
        );
    }

    get chapterIconStyles() {
        return chapters.map(ch => {
            const chImgUrl = this.resolveAsset(`chapters/${ch}.png`);
            return (
                `.saga-chapter .chapter-icon-${ch} {
                    background-image: url('${chImgUrl}');
                }`
            );
        }).join('\n');
    }

    async styles() {
        return [
            this.chapterBarStyle,
            this.chapterIconStyles,
            await this.loadFile('style.css')
        ];
    }
}
