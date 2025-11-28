export default class CostModule extends CardMagicianModule {
    async renderManaCost(card) {
        const manaCostSymbols = card.parseSymbols(card.manaCost);
        card.colorIdentity.addColorSource('card', manaCostSymbols);
        this.manaCostHTML = await card.symbolsToHTML(manaCostSymbols, true);
        this.requestRender();
    }

    bind(card, watch) {
        watch(() => card.manaCost, () => this.renderManaCost(card));
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
