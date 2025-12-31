export default class AutoNumberModule extends CardMagicianModule {
    async init() {
        this.set = this.getActiveSet();
        this.game = this.getActiveGame();
    }

    updateNumbering() {
        this.game.autoNumberCards(this.set);
    }

    bind(card, watch) {
        watch(card, ['name', 'color', 'colorIdentity', 'superType'],
            () => this.updateNumbering()
        );
        watch(this.set.info, 'collectorNumberFormat', () => this.updateNumbering());
    }
}
