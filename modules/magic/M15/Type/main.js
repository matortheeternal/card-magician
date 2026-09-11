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
        card.isToken = () => /\btoken\b/i.test(card.superType);
        card.isEmblem = () => /\bemblem\b/i.test(card.superType);
    }

    getImplicitLandSymbols(card) {
        if (!card.isLand()) return [];
        const implicitSymbols = [];
        if (/\bplains\b/i.test(card.subType))
            implicitSymbols.push({ colors: ['w'] });
        if (/\bisland\b/i.test(card.subType))
            implicitSymbols.push({ colors: ['u'] });
        if (/\bswamp\b/i.test(card.subType))
            implicitSymbols.push({ colors: ['b'] });
        if (/\bmountain\b/i.test(card.subType))
            implicitSymbols.push({ colors: ['r'] });
        if (/\bforest\b/i.test(card.subType))
            implicitSymbols.push({ colors: ['g'] });
        return implicitSymbols;
    }

    updateType(card) {
        if (card.colorIdentity) {
            card.colorIdentity.addColorSource('type', this.getImplicitLandSymbols(card));
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
