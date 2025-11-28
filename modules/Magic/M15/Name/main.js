export default class NameModule extends CardMagicianModule {
    async init(card) {
        await this.loadFont('Beleren Bold', 'beleren-bold_P1.01.ttf');
        card.getLegendName = function() {
            if (!card.isLegendary()) return card.name;
            const match = card.name.match(/^(.+),|(.+) the/);
            return match ? match[1] || match[2] : card.name;
        };
    }

    bind(card, watch) {
        watch(
            () => card.name,
            () => this.requestRender()
        );
    }

    render(card) {
        const game = this.getActiveGame();
        game.autoNumberCards(this.getActiveSet());

        return (
            `<auto-fit-line>${card.name}</auto-fit-line>`
        );
    }

    get fields() {
        return [{ id: 'name', displayName: 'Name' }];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
