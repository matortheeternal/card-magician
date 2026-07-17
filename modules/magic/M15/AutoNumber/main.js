export default class AutoNumberModule extends CardMageModule {
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
        watch(this.set, 'collectorNumberFormat', () => this.updateNumbering());
    }
}
