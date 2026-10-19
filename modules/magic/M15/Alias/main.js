const L = localize('module-M15-art');

export default class AliasModule extends CardMagicianModule {
    bind(card, watch) {
        watch(card, ['alias'], () => this.requestRender());
    }

    render(card) {
        if (!card.alias) return '';
        return (
            `<div>${card.alias}</div>`
        );
    }

    get fields() {
        return [{
            id: 'alias',
            label: L`Alias`,
            default: null
        }];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}


