const L = localize('module-M15-face-symbol');

export default class TypeModule extends CardMagicianModule {
    static createFields() {
        return [
            { id: 'superType', label: L`Super Type` },
            { id: 'subType', label: L`Sub Type` }
        ];
    }

    updateType(card) {
        if (card.colorIdentity) {
            card.colorIdentity.addColorSource('type', card.getImplicitLandSymbols());
            changed(card, 'colorIdentity');
        }
        this.requestRender();
    }

    bind(card, watch) {
        watch(card, ['superType', 'subType'], () => this.updateType(card));
    }

    render(card) {
        return card.subType ? (
            `<auto-fit-line>${card.superType} — ${card.subType}</auto-fit-line>`
        ) : (
            `<auto-fit-line>${card.superType}</auto-fit-line>`
        );
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
