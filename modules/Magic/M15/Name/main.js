const L = localize('module-M15-name');

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

    render(card, editable) {
        const nameHtml = this.escapeHTML(card.name);
        return `<auto-fit-line>${editable 
            ? `<cm-editable-text data-title="Name" field="name" contenteditable="true" part="editable-text">${nameHtml}</cm-editable-text>`
            : nameHtml
        }</auto-fit-line>`;
    }

    get fields() {
        return [{ id: 'name', label: L`Name` }];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
