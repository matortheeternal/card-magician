import textToHTML from './src/textToHTML.js';
import { stationCardExpr, StationConverter } from './src/StationConverter.js';
import { levelCardExpr, LevelConverter } from './src/LevelConverter.js';
import { ListConverter, listExpr } from './src/ListConverter.js';

const L = localize('module-M15-text');

export default class TextModule extends CardMagicianModule {
    async init(card) {
        this.flavorBarUrl = this.resolveAsset('grey bar.png');

        card.isCompanion = () => /^companion\b/i.test(card.rulesText);
        card.isMiracle = () => /\bmiracle\b/i.test(card.rulesText);
        card.isMutate = () => /^mutate\b/i.test(card.rulesText);
        card.hasLevels = () => levelCardExpr.test(card.rulesText);
        card.isStation = () => stationCardExpr.test(card.rulesText);
        card.hasChoices = () => listExpr.test(card.rulesText);
        card.hasNoText = () => !card.rulesText?.length && !card.flavorText?.length;

        card.textToHTML = (text, options) => {
            if (!text) return '';
            const html = this.escapeHTML(text);
            return textToHTML(html, card, options);
        };

        // TODO: probably should use a keyword system instead or be just user-configured
        card.isTransform = function() {
            return /\bTransform\b/i.test(card.rulesText)
                || /\bDaybound\b/i.test(card.rulesText)
                || /\bDisturb\b/i.test(card.rulesText)
                || /\bMore Than Meets the Eye\b/i.test(card.rulesText);
        };
    }

    get structureConverters() {
        return [ListConverter, LevelConverter, StationConverter];
    }

    async renderRulesHTML(card) {
        const textSymbols = [];
        card.rulesHTML = card.textToHTML(card.rulesText, {
            outputSymbols: textSymbols,
            structureConverters: this.structureConverters,
        });
        const oldColors = card.colorIdentity?.colors || [];
        card.colorIdentity?.addColorSource('text', textSymbols, !card.isLand());
        const newColors = card.colorIdentity?.colors || [];
        const colorIdentityChanged = oldColors.join('') !== newColors.join('');
        changed(card, [
            'rulesHTML',
            ...(colorIdentityChanged ? ['colorIdentity'] : [])
        ]);
        this.showFlavorBar = Boolean(card.flavorText && card.rulesText);
        this.requestRender();
    }

    async renderFlavorHTML(card) {
        this.flavorHTML = await card.textToHTML(card.flavorText);
        this.showFlavorBar = Boolean(card.flavorText && card.rulesText);
        this.requestRender();
    }

    bind(card, watch) {
        watch(card, ['rulesText', 'name', 'superType'], () => this.renderRulesHTML(card));
        watch(card, ['flavorText', 'citationStyle'], () => this.renderFlavorHTML(card));
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
            card.chopTop ? `--chop-top: ${card.chopTop}px` : '',
            card.chopBottom ? `--chop-bottom: ${card.chopBottom}px` : '',
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
            { id: 'rulesText', type: 'code', syntax: 'mtg', label: L`Rules Text` },
            { id: 'flavorText', type: 'textarea', label: L`Flavor Text`, default: null }
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
                id: 'citationStyle',
                label: L`Citation Style`,
                type: 'select',
                options: [
                    { id: 'italic', name: L`Italic` },
                    { id: 'normal', name: L`Normal` },
                ]
            }
        ];
    }

    get levelArrowStyles() {
        const colorKeys = ['a', 'b', 'c', 'g', 'm', 'r', 'u', 'w'];
        return colorKeys.map(colorKey => {
            const arrowPath = n => `arrows/level-${n}/${colorKey}.png`;
            return `.color-${colorKey} {
                --level-1-arrow: url("${this.resolveAsset(arrowPath(1))}");
                --level-2-arrow: url("${this.resolveAsset(arrowPath(2))}");
                --level-3-arrow: url("${this.resolveAsset(arrowPath(3))}");
            }`;
        }).join('\n\n');
    }

    get levelCircleStyles() {
        const colorKeys = ['a', 'b', 'c', 'g', 'm', 'r', 'u', 'w'];
        return colorKeys.map(colorKey => {
            const circlePath = this.resolveAsset(`circles/${colorKey}.png`);
            return `.color-${colorKey} {
                --station-circle: url("${circlePath}");
            }`;
        }).join('\n\n');
    }

    async styles() {
        return [
            await this.loadFile('style.css'),
            await this.loadFile('levelStyle.css'),
            await this.loadFile('stationStyle.css'),
            this.levelArrowStyles,
            this.levelCircleStyles,
        ];
    }
}
