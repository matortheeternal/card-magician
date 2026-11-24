import NameModule from '../../M15/Name/main.js';

const L = localize('module-classic-name');

const NAME_FONTS = {
    matrix:         { family: 'Matrix', size: 22.5, drop: 1 },
    magicMedieval:  { family: 'MagicMedieval', size: 20, drop: 1 },
};

export default class ClassicNameModule extends NameModule {
    static createOptions() {
        return [{
            id: 'nameFont',
            type: 'select',
            label: L`Name Font`,
            options: [
                { id: 'matrix',         name: L`Matrix` },
                { id: 'magicMedieval',  name: L`Magic Medieval` },
            ]
        }];
    }

    async init(card) {
        await super.init(card);
        await this.loadFont('MagicMedieval', 'magicmedieval.ttf');
    }

    bind(card, watch) {
        super.bind(card, watch);
        watch(card, 'nameFont', () => this.requestRender());
    }

    render(card) {
        const font = NAME_FONTS[card.nameFont];
        const style = [
            `font-family: '${font.family}', serif`,
            `margin-bottom: -${font.drop}px`
        ].join('; ');
        return (
            `<auto-fit-line max="${font.size}" style="${style}">`
            + this.escapeHTML(card.name)
            + '</auto-fit-line>'
        );
    }
}
