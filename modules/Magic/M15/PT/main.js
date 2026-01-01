const L = localize('module-M15-pt');

export default class PTModule extends CardMagicianModule {
    async updatePT(card) {
        const activeFrame = card.activeFrame?.();
        if (!activeFrame) return;
        card.showPT = Boolean(card.toughness || card.power);
        changed(card, 'showPT');
        const ptBackgrounds = await activeFrame.buildBackgrounds('pt', card);
        this.ptStyle = this.objectToStyle(ptBackgrounds[0].style);
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
        watch(card, ['toughness', 'power', 'activeFrame'], () => this.updatePT(card));
        watch(card, ['showNotchPT'],
              () => this.requestRender({ render: 'renderNotchPT' })
        );
    }

    renderPT(card) {
        if (!card.showPT) return;
        return (
            `<div class="pt-text" style="${this.ptStyle}">
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

    get fields() {
        return [
            { id: 'power', label: L`Power` },
            { id: 'toughness', label: L`Toughness` }
        ];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
