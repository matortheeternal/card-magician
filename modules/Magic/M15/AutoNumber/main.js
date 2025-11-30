export default class AutoNumberModule extends CardMagicianModule {
    bind(card, watch) {
        watch(
            () => [card.name, card.color, card.colorIdentity, card.superType, card.subType],
            () => {
                const set = this.getActiveSet();
                const game = this.getActiveGame();
                game.autoNumberCards(set);
            }
        )
    }
}