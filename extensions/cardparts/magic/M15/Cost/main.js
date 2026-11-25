const L = localize('module-M15-cost');

const ManaCost = activeGame.ManaScribe.ManaCost;

export default class CostModule extends CardMagicianModule {
    static createOptions() {
        return [{
            id: 'symbolOrder',
            label: L`Symbol Order`,
            type: 'select',
            options: [
                { id: 'standard', name: L`Standard` },
                { id: 'custom',   name: L`Custom` },
            ]
        }];
    }

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
        const symbols = card.symbolOrder === 'custom'
            ? manaCost.symbols
            : manaCost.orderedSymbols;
        card.colorIdentity.addColorSource('cost', symbols);
        changed(card, 'colorIdentity');
        this.manaCostHTML = await card.symbolsToHTML(symbols, true);
        this.requestRender();
    }

    bind(card, watch) {
        watch(card, ['manaCost', 'symbolOrder'], () => this.updateManaCost(card));
    }

    render() {
        return this.manaCostHTML;
    }
}
