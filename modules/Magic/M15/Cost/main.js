export default class CostModule extends CardMagicianModule {
    async renderManaCost(card) {
        const game = this.getActiveGame();
        const ManaCost = game.ManaScribe.ManaCost;
        const manaCost = ManaCost.parse(card.manaCost);
        card.colorIdentity.addColorSource('card', manaCost.symbols);
        this.manaCostHTML = await card.symbolsToHTML(manaCost.symbols, true);
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
