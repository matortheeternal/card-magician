const L = localize('module-M15-face-symbol');

function hasWord(value, word) {
    const pattern = new RegExp(`\\b${word}\\b`, 'i');
    return pattern.test(value);
}

export default class TypeModule extends CardMagicianModule {
    static createFields() {
        return [
            { id: 'superType', label: L`Super Type` },
            { id: 'subType', label: L`Sub Type` }
        ];
    }

    async init(card) {
        card.isLegendary = () => hasWord(card.superType, 'legendary');
        card.isLand = () => hasWord(card.superType, 'land');
        card.isCreature = () => hasWord(card.superType, 'creature');
        card.isArtifact = () => hasWord(card.superType, 'artifact');
        card.isEnchantment = () => hasWord(card.superType, 'enchantment');
        card.isVehicle = () => hasWord(card.subType, 'vehicle');
        card.isSnow = () => hasWord(card.superType, 'snow');
        card.isConspiracy = () => hasWord(card.superType, 'conspiracy');
        card.isToken = () => hasWord(card.superType, 'token');
        card.isEmblem = () => hasWord(card.superType, 'emblem');
    }

    getImplicitLandSymbols(card) {
        if (!card.isLand()) return [];
        const implicitSymbols = [];
        if (hasWord(card.subType, 'plains'))
            implicitSymbols.push({ colors: ['w'] });
        if (hasWord(card.subType, 'island'))
            implicitSymbols.push({ colors: ['u'] });
        if (hasWord(card.subType, 'swamp'))
            implicitSymbols.push({ colors: ['b'] });
        if (hasWord(card.subType, 'mountain'))
            implicitSymbols.push({ colors: ['r'] });
        if (hasWord(card.subType, 'forest'))
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

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
