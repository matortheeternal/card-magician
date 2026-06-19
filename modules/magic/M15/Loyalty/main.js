const L = localize('module-M15-loyalty');

export default class LoyaltyModule extends CardMagicianModule {
    bind(card, watch) {
        watch(card, ['loyalty'], () => this.requestRender());
    }

    render(card) {
        const loyaltyImage = this.resolveAsset('loyalty.png');
        const style = `background-image: url('${loyaltyImage}')`;
        return (
            `<div class="loyalty-text" style="${style}">
                ${this.escapeHTML(card.loyalty)}
            </div>`
        );
    }

    get fields() {
        return [{ id: 'loyalty', label: L`Loyalty` }];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
