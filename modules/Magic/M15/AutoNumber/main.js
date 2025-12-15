export default class AutoNumberModule extends CardMagicianModule {
    async init() {
        this.set = this.getActiveSet();
        this.game = this.getActiveGame();
    }

    updateNumbering() {
        this.game.autoNumberCards(this.set);
    }

    bind(card, watch) {
        watch(
            () => [card.name, card.color, card.colorIdentity, card.superType,
                   this.set.info.collectorNumberFormat],
            () => this.updateNumbering()
        );
    }
}
