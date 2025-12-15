const L = localize('module-M15-flag');

export default class FlagModule extends CardMagicianModule {
    updateFlagStyle(card) {
        const key = card.getCardColorKey();
        const folder = card.id === 'back' ? 'back' : 'front';
        const url = this.resolveAsset(`${folder}/${key}.png`);
        this.flagStyle = `background-image: url('${url}')`;
        this.requestRender();
    }

    updateShowFlag(card) {
        card.showFlag = (card.isFrontDFC?.() && !card.isTransform?.())
            || (card.isBackDFC?.() && !card.parent().front.isTransform?.());
    }

    async updateFlagRightHTML(card) {
        this.flagRightHTML = card.textToHTML(card.flagRight);
        this.requestRender();
    }

    bind(card, watch) {
        watch(
            () => card.flagRight,
            () => this.updateFlagRightHTML(card)
        );
        watch(
            () => [card.colorIdentity, card.superType],
            () => this.updateFlagStyle(card)
        )
        watch(
            () => [card.rulesText, card.parent],
            () => this.updateShowFlag(card)
        );
        watch(
            () => [card.showFlag, card.flagLeft],
            () => this.requestRender()
        );
    }

    render(card) {
        if (!card.showFlag) return;
        return (
            `<div class="flag" style="${this.flagStyle}">
                <div class="flag-left">${this.escapeHTML(card.flagLeft)}</div>
                <div class="flag-right">${this.flagRightHTML}</div>
            </div>`
        );
    }

    get fields() {
        return [
            { id: 'flagLeft', label: L`Flag Left` },
            { id: 'flagRight', label: L`Flag Right` }
        ];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
