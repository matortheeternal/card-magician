import textToHTML from './src/textToHTML.js';

export default class TextModule extends CardMagicianModule {
    async init(card) {
        await this.loadFont('MPlantin-Italic', 'mplantinit.ttf');
        this.flavorBarUrl = this.resolveAsset('grey bar.png');
        card.textToHTML = textToHTML;

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
        card.rulesHTML = await card.textToHTML(card.rulesText, card, textSymbols);
        card.colorIdentity?.addColorSource('text', textSymbols, !card.isLand());
        this.showFlavorBar = Boolean(card.flavorText && card.rulesText);
        this.requestRender();
    }

    async renderFlavorHTML(card) {
        this.flavorHTML = await card.textToHTML(card.flavorText, card);
        this.showFlavorBar = Boolean(card.flavorText && card.rulesText);
        this.requestRender();
    }

    bind(card, watch) {
        watch(() => card.rulesText, () => this.renderRulesHTML(card));
        watch(() => card.flavorText, () => this.renderFlavorHTML(card));
        watch(
            () => [card.showPT, card.showFlag, card.maxFontSize],
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

    render(card) {
        const flavorBarStyle = [
            `background-image: url('${this.flavorBarUrl}')`,
            this.showFlavorBar ? '' : 'display: none'
        ].join('; ');
        const avoid = this.getAvoidSelectors(card).join('; ');
        const className = `text${card.showFlag ? ' flag-padding' : ''}`;
        const maxFont = card.maxFontSize || '19';
        return (
            `<auto-fit-text max="${maxFont}" class="${className}" avoid="${avoid}">
                <div class="rules-text">${card.rulesHTML}</div>
                <div class="flavor-bar" style="${flavorBarStyle}"></div>
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
