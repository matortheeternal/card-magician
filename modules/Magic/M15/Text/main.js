export default class TextModule extends CardMagicianModule {
    async init(card) {
        await this.loadFont('MPlantin-Italic', 'mplantinit.ttf');
        const { textToHTML } = await this.import('textToHTML.js');
        this.flavorBarUrl = await this.assetURL('grey bar.png');
        card.textToHTML = textToHTML;

        // TODO: probably should use a keyword system instead or be just user-configured
        card.isTransform = function() {
            return /\bTransform\b/i.test(card.rulesText)
                || /\bDaybound\b/i.test(card.rulesText)
                || /\bDisturb\b/i.test(card.rulesText)
                || /\bMore Than Meets the Eye\b/i.test(card.rulesText);
        };
    }

    updateForbiddenRects(card) {
        const forbiddenRects = [];
        if (card.showPT) {
            const ptSelector = 'module-container[module="PT"]';
            const ptContainer = card.dom.querySelector(ptSelector);
            const rects = ptContainer.getClientRects();
            forbiddenRects.push(...rects);
        }
        if (card.showStamp) {
            // TODO: stamp rect
        }
        card.forbiddenRects = forbiddenRects;
    }

    async renderRulesHTML(card) {
        this.rulesHTML = await card.textToHTML(card.rulesText, card);
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
        watch(() => card.showPT, () => {
            requestAnimationFrame(() => this.updateForbiddenRects(card));
        });
        watch(() => card.showFlag, () => this.requestRender());
    }

    render(card) {
        const flavorBarStyle = [
            `background-image: url('${this.flavorBarUrl}')`,
            this.showFlavorBar ? '' : 'display: none'
        ].join('; ');
        const className = `text${card.showFlag ? ' flag-padding' : ''}`;
        return (
            `<auto-fit-text class="${className}">
                <div class="rules-text">${this.rulesHTML}</div>
                <div class="flavor-bar" style="${flavorBarStyle}"></div>
                <div class="flavor-text">${this.flavorHTML}</div>
            </auto-fit-text>`
        );
    }

    get fields() {
        return [{
            id: 'rulesText',
            type: 'textarea',
            displayName: 'Rules Text'
        }, {
            id: 'flavorText',
            type: 'textarea',
            displayName: 'Flavor Text'
        }];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
