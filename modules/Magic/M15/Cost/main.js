import ColorIdentity from './src/ColorIdentity.js';

export default class CostModule extends CardMagicianModule {
    async init(card) {
        card.colorIdentity = new ColorIdentity();

        card.getCardColorKey = function() {
            const colors = card.colorIdentity.colors;
            if (colors.length === 0)
                return card.superType.includes('Artifact') ? 'a' : 'c';
            if (colors.length === 1)
                return colors[0].char;
            return 'm';
        };
    }

    async renderManaCost(card) {
        const manaCostSymbols = card.parseSymbols(card.manaCost);
        card.colorIdentity.addColorSource('card', manaCostSymbols);
        this.manaCostHTML = await card.symbolsToHTML(manaCostSymbols, true);
        this.requestRender();
    }

    bind(card, watch) {
        watch(
            () => card.manaCost,
            () => this.renderManaCost(card)
        );
    }

    get fields() {
        return [{ id: 'manaCost', displayName: 'Mana Cost' }];
    }

    render() {
        return this.manaCostHTML;
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
