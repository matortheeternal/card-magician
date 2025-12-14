const L = localize('module-M15-face-symbol');

export default class TypeModule extends CardMagicianModule {
    async init(card) {
        card.isLegendary = () => /\blegendary\b/i.test(card.superType);
        card.isLand = () => /\bland\b/i.test(card.superType);
        card.isArtifact = () => /\bartifact\b/i.test(card.superType);
        card.isEnchantment = () => /\benchantment\b/i.test(card.superType);
        card.isVehicle = () => /\bvehicle\b/i.test(card.subType);
        card.isSnow = () => /\bsnow\b/i.test(card.superType);
        card.isConspiracy = () => /\bconspiracy\b/i.test(card.superType);
    }

    bind(card, watch) {
        watch(() => [card.superType, card.subType],
              () => this.requestRender());
    }

    render(card) {
        return card.subType ? (
            `<auto-fit-line>${card.superType} — ${card.subType}</auto-fit-line>`
        ) : (
            `<auto-fit-line>${card.superType}</auto-fit-line>`
        )
    }

    get fields() {
        return [
            { id: 'superType', label: L`Super Type` },
            { id: 'subType', label: L`Sub Type` }
        ];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
