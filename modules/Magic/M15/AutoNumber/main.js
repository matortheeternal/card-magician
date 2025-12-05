export default class AutoNumberModule extends CardMagicianModule {
    updateNumbering() {
        const set = this.getActiveSet();
        const game = this.getActiveGame();
        game.autoNumberCards(set);
    }

    bind(card, watch) {
        watch(
            () => [card.name, card.color, card.colorIdentity, card.superType],
            () => this.updateNumbering()
        )
    }
}
