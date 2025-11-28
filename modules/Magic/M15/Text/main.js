import textToHTML from './src/textToHTML.js';

export default class TextModule extends CardMagicianModule {
    async init(card) {
        await this.loadFont('MPlantin-Italic', 'mplantinit.ttf');
        this.flavorBarUrl = this.resolveAsset('grey bar.png');

        card.textToHTML = function(text, outputSymbols) {
            return textToHTML(text, card).map(p => {
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
        this.showFlavorBar = Boolean(card.flavorText && card.rulesText);
        this.requestRender();
    }

    async renderFlavorHTML(card) {
        this.flavorHTML = await card.textToHTML(card.flavorText);
        this.showFlavorBar = Boolean(card.flavorText && card.rulesText);
        this.requestRender();
    }

    bind(card, watch) {
        watch(() => card.rulesText, () => this.renderRulesHTML(card));
        watch(() => card.flavorText, () => this.renderFlavorHTML(card));
        watch(
            () => [card.showPT, card.showFlag, card.maxFontSize,
                   card.chopTop, card.chopBottom],
            () => this.requestRender()
        );
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
        ].join('; ')
    }

    getTextStyle(card) {
        return [
            card.chopTop ? `margin-top: ${card.chopTop}px` : '',
            card.chopBottom ? `margin-bottom: ${card.chopBottom}px` : ''
        ].filter(Boolean).join('; ');
    }

    render(card) {
        const className = `text${card.showFlag ? ' flag-padding' : ''}`;
        return (
            `<auto-fit-text 
               max="${card.maxFontSize || '19'}" 
               class="${className}" 
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
            { id: 'rulesText', type: 'textarea', displayName: 'Rules Text' },
            { id: 'flavorText', type: 'textarea', displayName: 'Flavor Text' }
        ];
    }

    get options() {
        return [
            { id: 'chopTop', displayName: 'Chop Top' },
            { id: 'chopBottom', displayName: 'Chop Bottom' },
            { id: 'maxFontSize', displayName: 'Max Font Size' }
        ];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
