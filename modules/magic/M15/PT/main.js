const L = localize('module-M15-pt');

export default class PTModule extends CardMagicianModule {
    static createFields() {
        return [
            { id: 'power', label: L`Power` },
            { id: 'toughness', label: L`Toughness` },
            { id: 'showPT' },
        ];
    }

    async init(card) {
        card.showPT = Boolean(card.toughness || card.power);
    }

    async updatePT(card) {
        changed(card, 'showPT');
        await this.updateFrontNotchPt(card);
        this.requestRender({ render: 'renderPT' });
    }

    updateFrontNotchPt(card) {
        if (card.id !== 'back') return;
        const frontCard = card.parent().front;
        frontCard.showNotchPT = card.showPT && frontCard?.isTransform();
        frontCard.notchPtText = `${card.power}/${card.toughness}`;
        changed(frontCard, 'showNotchPT');
        changed(frontCard, 'notchPtText');
    }

    bind(card, watch) {
        watch(card, ['toughness', 'power'], () => this.updatePT(card));
        watch(card, ['showNotchPT'],
              () => this.requestRender({ render: 'renderNotchPT' })
        );
    }

    renderPT(card) {
        if (!card.showPT) return;
        return (
            `<div class="pt-text">
                <span>${this.escapeHTML(card.power)}</span>
                <span class="d">/</span>
                <span>${this.escapeHTML(card.toughness)}</span>
            </div>`
        );
    }

    renderNotchPT(card) {
        if (!card.showNotchPT) return;
        return (
            `<div class="notch-pt-text">${this.escapeHTML(card.notchPtText)}</div>`
        );
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
