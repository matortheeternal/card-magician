import TextModule from '../Text/main.js';
import romanToInt from './src/romanToInt.js';
import { ChapterConverter, parseChapters, chapters } from './src/ChapterConverter.js';

const L = localize('module-M15-sagatext');

export default class SagaText extends TextModule {
    static createFields() {
        return [
            { id: 'preText', type: 'textarea', label: L`Pretext` },
            { id: 'postText', type: 'textarea', label: L`Post Text` },
            ...super.createFields()
        ];
    }

    get structureConverters() {
        return [ChapterConverter];
    }

    get maxChapter() {
        const chapters = parseChapters(this.card.rulesText);
        if (!chapters.length) return 'III';
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

    async renderPreHTML(card) {
        this.preHTML = card.textToHTML(card.preText || this.defaultPreText);
        changed(card, ['preHTML']);
        this.requestRender({ render: 'renderPreText' });
    }

    async renderPostHTML(card) {
        this.postHTML = card.textToHTML(card.postText || '');
        changed(card, ['postHTML']);
        this.requestRender({ render: 'renderPostText' });
    }

    bind(card, watch) {
        super.bind(card, watch);
        watch(card, ['maxFontSize', 'chopTop', 'chopBottom', 'preText'],
              () => this.renderPreHTML(card));
        watch(card, ['maxFontSize', 'chopTop', 'chopBottom', 'postText'],
              () => this.renderPostHTML(card));
    }

    getTextStyle(card, isPreText = false) {
        const chopTop = card.chopTop ? `--chop-top: ${card.chopTop}px` : '';
        const chopBottom = card.chopBottom ? `--chop-bottom: ${card.chopBottom}px` : '';
        return [
            isPreText ? chopTop : chopBottom,
            this.shouldCenter(card) ? 'text-align: center' : '',
        ].filter(Boolean).join('; ');
    }

    renderPreText(card) {
        return (
            `<auto-fit-text
               ${card.maxFontSize ? `max="${card.maxFontSize}"` : ''}
               style="${this.getTextStyle(card, true)}"
           >
                <div class="pre-text">${this.preHTML}</div>
            </auto-fit-text>`
        );
    }

    renderPostText(card) {
        return (
            `<auto-fit-text
               ${card.maxFontSize ? `max="${card.maxFontSize}"` : ''}
               style="${this.getTextStyle(card)}"
           >
                <div class="post-text">${this.postHTML}</div>
            </auto-fit-text>`
        );
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
        return [this.chapterBarStyle, this.chapterIconStyles];
    }
}
