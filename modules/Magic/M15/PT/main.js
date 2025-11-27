export default class PTModule extends CardMagicianModule {
    updateShowPT(card) {
        card.showPT = Boolean(card.toughness || card.power);
        this.requestRender({ render: 'renderPT' });
    }

    updateFrontNotchPt(card) {
        if (!card.parent || card.id !== 'back') return;
        const frontCard = card.parent().front;
        frontCard.showNotchPT = card.showPT && frontCard.frameFolder === 'notched';
        frontCard.notchPtText = `${card.power}/${card.toughness}`;
        this.requestRender({ render: 'renderNotchPT' });
    }

    async updatePtStyle(card) {
        const key = card.isVehicle() ? 'v' : card.getCardColorKey();
        const url = this.resolveAsset(key + '.png');
        this.ptStyle = `background-image: url('${url}')`;
        this.requestRender({ render: 'renderPT' });
    }

    bind(card, watch) {
        watch(
            () => [card.subType, card.colorIdentity],
            () => this.updatePtStyle(card)
        );
        watch(
            () => [card.toughness, card.power],
            () => this.updateShowPT(card)
        );
        watch(
            () => card.parent,
            () => this.updateFrontNotchPt(card)
        );
        watch(
            () => card.showNotchPT,
            () => this.requestRender({ render: 'renderNotchPT' })
        );
    }

    renderPT(card) {
        if (!card.showPT) return;
        return (
            `<div class="pt-text" style="${this.ptStyle}">
                ${card.power}/${card.toughness}
            </div>`
        );
    }

    renderNotchPT(card) {
        if (!card.showNotchPT) return;
        return (
            `<div class="notch-pt-text">${card.notchPtText}</div>`
        );
    }

    get fields() {
        return [
            { id: 'power', displayName: 'Power' },
            { id: 'toughness', displayName: 'Toughness' }
        ];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
