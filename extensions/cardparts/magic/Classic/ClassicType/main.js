import TypeModule from '../../M15/Type/main.js';

export default class ClassicTypeModule extends TypeModule {
    bind(card, watch) {
        super.bind(card, watch);
        watch(card, 'activeFrame', () => this.requestRender());
    }

    typeText(card) {
        if (!card.subType) return card.superType;
        return `${card.superType} — ${card.subType}`;
    }

    render(card) {
        const font = card.activeFrame?.().typeFont;
        if (!font) return '';
        const style = `font-family: '${font.family}', serif`;
        return (
            `<auto-fit-line max="${font.size}" style="${style}">`
            + this.typeText(card)
            + '</auto-fit-line>'
        );
    }
}
