export default class CostModule extends CardMagicianModule {
    async init() {
        const game = this.getActiveGame();
        this.ManaCost = game.ManaScribe.ManaCost;
    }

    async updateManaCost(card) {
        const manaCost = this.ManaCost.parse(card.manaCost);
        card.colorIdentity.addColorSource('card', manaCost.symbols);
        this.manaCostHTML = await card.symbolsToHTML(manaCost.symbols, true);
        this.requestRender();
    }

    bind(card, watch) {
        watch(() => card.manaCost, () => this.updateManaCost(card));
    }

    get fields() {
        return [{
            id: 'manaCost',
            label: 'Mana Cost',
            save: value => this.ManaCost.parse(value),
            load: data  => data.manaCost.toString()
        }];
    }

    render() {
        return this.manaCostHTML;
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
