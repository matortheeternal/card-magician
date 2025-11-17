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
            // x-fit-text="{text: [superType, subType]}"
            `<div class="type-text">${card.superType} — ${card.subType}</div>`
        ) : (
            `<div class="type-text">${card.superType}</div>`
        )
    }

    get fields() {
        return [{
            id: 'superType',
            displayName: 'Super Type',
            group: 'typeLine'
        }, {
            id: 'subType',
            displayName: 'Sub Type',
            group: 'typeLine'
        }];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
