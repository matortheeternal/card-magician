export default class TypeModule extends CardMagicianModule {
    async init(card) {
        card.isLegendary = function() {
            return /legendary/i.test(card.superType);
        };

        card.isLand = function() {
            return /land/i.test(card.superType);
        };

        card.isArtifact = function() {
            return /artifact/i.test(card.superType);
        };

        card.isEnchantment = function() {
            return /enchantment/i.test(card.superType);
        };

        card.isVehicle = function() {
            return /vehicle/i.test(card.subType);
        };

        card.isSnow = function() {
            return /snow/i.test(card.superType);
        };
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
            { id: 'superType', label: 'Super Type' },
            { id: 'subType', label: 'Sub Type' }
        ];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
