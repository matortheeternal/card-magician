const L = localize('module-M15-name');

export default class NameModule extends CardMagicianModule {
    static createFields() {
        return [{ id: 'name', label: L`Name` }];
    }

    async init(card) {
        card.getLegendName = function() {
            if (!card.isLegendary()) return card.name;
            const match = card.name.match(/^(.+),|(.+) the/);
            return match ? match[1] || match[2] : card.name;
        };
    }

    bind(card, watch) {
        watch(card, 'name', () => this.requestRender());
    }

    render(card) {
        return (
            `<auto-fit-line>${this.escapeHTML(card.name)}</auto-fit-line>`
        );
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
