export default class FlagModule extends CardMagicianModule {
    async updateFlagStyle(card) {
        const key = card.getCardColorKey();
        const folder = card.id === 'back' ? 'back' : 'front';
        const url = await this.assetURL(`${folder}/${key}.png`);
        this.flagStyle = `background-image: url('${url}')`;
        this.requestRender();
    }

    updateShowFlag(card) {
        if (!card.parent || card.id !== 'front') return;
        const backCard = card.parent().back;
        const showFlag = Boolean(backCard && card.frameFolder !== 'notched');
        card.showFlag = showFlag;
        if (backCard) backCard.showFlag = showFlag;
    }

    async updateFlagRightHTML(card) {
        this.flagRightHTML = await card.textToHTML(card.flagRight, card);
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
            () => [card.frameFolder, card.parent],
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
                <div class="flag-left">${card.flagLeft}</div>
                <div class="flag-right">${this.flagRightHTML}</div>
            </div>`
        );
    }

    get fields() {
        return [{
            id: 'flagLeft',
            displayName: 'Flag Left',
            group: 'flag',
        }, {
            id: 'flagRight',
            displayName: 'Flag Right',
            group: 'flag',
        }]
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
