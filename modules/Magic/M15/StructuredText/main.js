import textToHTML from '../Text/src/textToHTML.js';

const L = localize('module-M15-text');

const allowedTags = [
    'b', 'ol', 'pre', 'ul', 'li', 'br', 'code',
    'em', 'q', 'strong', 'sub', 'sup', 'u', 'sym'
];

export default class StructuredTextModule extends CardMagicianModule {
    async init(card) {
        await this.loadFont('MPlantin-Italic', 'mplantinit.ttf');

        card.hasNoFlavorText = () => !card.flavorText.length;

        card.textToHTML = (text, options = {}) => {
            const html = this.sanitize(text, { allowedTags });
            return textToHTML(html, card, options).map(p => p.html).join('');
        };

        card.isTransform = function() {
            return /\bTransform\b/i.test(card.rulesText);
        };
    }

    get structureConverters() {
        return [];
    }

    get defaultPreText() {
        return '';
    }

    async renderPreHTML(card) {
        this.preHTML = card.textToHTML(card.preText || this.defaultPreText);
        changed(card, ['preHTML']);
        this.requestRender({ render: 'renderPreText' });
    }

    async renderRulesHTML(card) {
        const textSymbols = [];
        card.rulesHTML = card.textToHTML(card.rulesText, {
            outputSymbols: textSymbols,
            structureConverters: this.structureConverters,
        });
        card.colorIdentity?.addColorSource('text', textSymbols, !card.isLand());
        changed(card, ['colorIdentity', 'rulesHTML']);
        this.requestRender({ render: 'renderRulesText' });
    }

    async renderFlavorHTML(card) {
        this.flavorHTML = await card.textToHTML(card.flavorText);
        this.requestRender({ render: 'renderFlavorText' });
    }

    bind(card, watch) {
        watch(card, 'preText', () => this.renderPreHTML(card));
        watch(card, 'rulesText', () => this.renderRulesHTML(card));
        watch(card, 'flavorText', () => this.renderFlavorHTML(card));
        watch(card, ['maxFontSize', 'chopTop', 'chopBottom'],
              () => this.requestRender({ render: 'renderRulesText' }));
    }

    getTextStyle(card) {
        return [
            card.chopTop ? `margin-top: ${card.chopTop}px` : '',
            card.chopBottom ? `margin-bottom: ${card.chopBottom}px` : '',
        ].filter(Boolean).join('; ');
    }

    renderPreText(card) {
        return (
            `<auto-fit-text
               ${card.maxFontSize ? `max="${card.maxFontSize}"` : ''}
           >
                <div class="pre-text">${this.preHTML}</div>
            </auto-fit-text>`
        );
    }

    renderRulesText(card) {
        return (
            `<auto-fit-text
               ${card.maxPreFontSize ? `max="${card.maxPreFontSize}"` : ''}
               style="${this.getTextStyle(card)}"
            >
                <div class="rules-text">${card.rulesHTML}</div>
            </auto-fit-text>`
        );
    }

    renderFlavorText(card) {
        return (
            `<auto-fit-text
               ${card.maxFlavorFontSize ? `max="${card.maxFlavorFontSize}"` : ''}
               style="text-align: center"
           >
                <div class="flavor-text">${this.flavorHTML}</div>
            </auto-fit-text>`
        );
    }

    get fields() {
        return [
            { id: 'preText', type: 'textarea', label: L`Pretext` },
            { id: 'rulesText', type: 'textarea', label: L`Rules Text` },
            { id: 'flavorText', type: 'textarea', label: L`Flavor Text` }
        ];
    }

    get options() {
        return [
            { id: 'chopTop', label: L`Chop Top` },
            { id: 'chopBottom', label: L`Chop Bottom` },
            { id: 'maxFontSize', label: L`Max Font Size` },
            { id: 'maxPreFontSize', label: L`Max Pretext Font Size` },
            { id: 'maxFlavorFontSize', label: L`Max Flavor Font Size` },
        ];
    }
}
