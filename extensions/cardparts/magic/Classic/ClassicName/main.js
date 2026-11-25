import NameModule from '../../M15/Name/main.js';
import proxyAutoOptions from '../../M15/Frame/src/proxyAutoOptions.js';

const L = localize('module-classic-name');

const NAME_FONTS = {
    matrix:         { family: 'Matrix', drop: 1 },
    magicMedieval:  { family: 'MagicMedieval', drop: 1 },
    mplantin:       { family: 'MPlantin', drop: 0 },
};

function computeNameFont(card) {
    return card.activeFrame?.().defaultNameFont || 'matrix';
}

export default class ClassicNameModule extends NameModule {
    static createOptions() {
        return [{
            id: 'nameFont',
            type: 'select',
            label: L`Name Font`,
            options: [
                { id: 'auto',           name: L`Auto`, compute: computeNameFont },
                { id: 'matrix',         name: L`Matrix` },
                { id: 'magicMedieval',  name: L`Magic Medieval` },
                { id: 'mplantin',       name: L`MPlantin` },
            ]
        }];
    }

    async init(card) {
        await super.init(card);
        await this.loadFont('MagicMedieval', 'magicmedieval.ttf');
    }

    bind(card, watch) {
        super.bind(card, watch);
        watch(card, ['nameFont', 'activeFrame'], () => this.requestRender());
    }

    render(card) {
        const frame = card.activeFrame?.();
        if (!frame) return '';
        const { nameFont } = proxyAutoOptions(card, this.options);
        const font = NAME_FONTS[nameFont];
        const size = frame.nameFontSizes[nameFont];
        const style = [
            `font-family: '${font.family}', serif`,
            `margin-bottom: -${font.drop}px`
        ].join('; ');
        return (
            `<auto-fit-line max="${size}" style="${style}">`
            + this.escapeHTML(card.name)
            + '</auto-fit-line>'
        );
    }
}
