import { getConverters } from './src/converters.js';
import textToHTML from './src/textToHTML.js';

const L = localize('module-M15-text');

const allowedTags = [
    'b', 'ol', 'pre', 'ul', 'li', 'br', 'code',
    'em', 'q', 'strong', 'sub', 'sup', 'u', 'sym'
];

export default class TextModule extends CardMagicianModule {
    async init(card) {
        await this.loadFont('MPlantin-Italic', 'mplantinit.ttf');
        this.flavorBarUrl = this.resolveAsset('grey bar.png');

        card.isCompanion = () => /^companion\b/i.test(card.rulesText);
        card.isMiracle = () => /\bmiracle\b/i.test(card.rulesText);
        card.isMutate = () => /^mutate\b/i.test(card.rulesText);

        card.textToHTML = (text, outputSymbols) => {
            const html = this.sanitize(text, { allowedTags });
            const game = this.getActiveGame();
            const converters = getConverters(game);

            return textToHTML(html, card, converters, game).map(p => {
                if (outputSymbols)
                    p.symbols.forEach(sym => outputSymbols.push(sym));
                return p.html;
            }).join('');
        };

        // TODO: probably should use a keyword system instead or be just user-configured
        card.isTransform = function() {
            return /\bTransform\b/i.test(card.rulesText)
                || /\bDaybound\b/i.test(card.rulesText)
                || /\bDisturb\b/i.test(card.rulesText)
                || /\bMore Than Meets the Eye\b/i.test(card.rulesText);
        };
    }

    async renderRulesHTML(card) {
        const textSymbols = [];
        card.rulesHTML = card.textToHTML(card.rulesText, textSymbols);
        card.colorIdentity?.addColorSource('text', textSymbols, !card.isLand());
        changed(card, ['colorIdentity', 'rulesHTML']);
        this.showFlavorBar = Boolean(card.flavorText && card.rulesText);
        this.requestRender();
    }

    async renderFlavorHTML(card) {
        this.flavorHTML = await card.textToHTML(card.flavorText);
        this.showFlavorBar = Boolean(card.flavorText && card.rulesText);
        this.requestRender();
    }

    bind(card, watch) {
        watch(card, 'rulesText', () => this.renderRulesHTML(card));
        watch(card, 'flavorText', () => this.renderFlavorHTML(card));
        watch(card, [
            'showPT', 'showFlag', 'maxFontSize',
            'chopTop', 'chopBottom', 'centerText'
        ], () => this.requestRender());
    }

    getAvoidSelectors(card) {
        const a = [];
        if (card.showPT || card.showNotchPT)
            a.push(`module-container[module='PT']`);
        if (card.showStamp)
            a.push(`module-container[module='Stamp']`);
        return a;
    }

    getFlavorBarStyle() {
        return [
            `background-image: url('${this.flavorBarUrl}')`,
            this.showFlavorBar ? '' : 'display: none'
        ].join('; ');
    }

    shouldCenter(card) {
        if (card.centerText === 'always') return true;
        return card.centerText === 'short'
            && card.rulesText.length < 15
            && !card.flavorText.length;
    }

    getTextStyle(card) {
        return [
            card.chopTop ? `margin-top: ${card.chopTop}px` : '',
            card.chopBottom ? `margin-bottom: ${card.chopBottom}px` : '',
            this.shouldCenter(card) ? 'text-align: center' : '',
        ].filter(Boolean).join('; ');
    }

    getTextClassName(card) {
        return [
            'text',
            card.showFlag ? 'flag-padding' : '',
        ].filter(Boolean).join(' ');
    }

    render(card) {
        return (
            `<auto-fit-text
               ${card.maxFontSize ? `max="${card.maxFontSize}"` : ''}
               class="${this.getTextClassName(card)}"
               avoid="${this.getAvoidSelectors(card).join('; ')}"
               style="${this.getTextStyle(card)}"
              >
                <div class="rules-text">${card.rulesHTML}</div>
                <div class="flavor-bar" style="${this.getFlavorBarStyle()}"></div>
                <div class="flavor-text">${this.flavorHTML}</div>
            </auto-fit-text>`
        );
    }

    get fields() {
        return [
            { id: 'rulesText', type: 'textarea', label: L`Rules Text` },
            { id: 'flavorText', type: 'textarea', label: L`Flavor Text` }
        ];
    }

    get options() {
        return [
            { id: 'chopTop', label: L`Chop Top` },
            { id: 'chopBottom', label: L`Chop Bottom` },
            { id: 'maxFontSize', label: L`Max Font Size` },
            {
                id: 'centerText',
                label: L`Center Text`,
                type: 'select',
                options: [
                    { id: 'never', name: L`Never` },
                    { id: 'always', name: L`Always` },
                    { id: 'short', name: L`Short Text` },
                ]
            },
            {
                id: 'autoRt',
                label: L`Show Reminder Text`,
                type: 'select',
                options: [
                    { id: 'default', name: L`Default` },
                    { id: 'all', name: L`All Keywords` },
                    { id: 'none', name: L`No Keywords` }
                ]
            }
        ];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
