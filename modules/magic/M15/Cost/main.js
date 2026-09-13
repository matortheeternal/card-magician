const L = localize('module-M15-cost');

const ManaCost = activeGame.ManaScribe.ManaCost;

export default class CostModule extends CardMagicianModule {
    static createFields() {
        return [{
            id: 'manaCost',
            label: L`Mana Cost`,
            save: value => ManaCost.parse(value),
            load: data  => data.manaCost.toString()
        }];
    }

    async updateManaCost(card) {
        const manaCost = ManaCost.parse(card.manaCost);
        card.colorIdentity.addColorSource('cost', manaCost.symbols);
        changed(card, 'colorIdentity');
        this.manaCostHTML = await card.symbolsToHTML(manaCost.symbols, true);
        this.requestRender();
    }

    bind(card, watch) {
        watch(card, 'manaCost', () => this.updateManaCost(card));
    }

    render() {
        return this.manaCostHTML;
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
