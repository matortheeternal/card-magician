const L = localize('module-M15-pt');

export default class PTModule extends CardMagicianModule {
    async updatePT(card) {
        const activeFrame = card.activeFrame?.();
        if (!activeFrame) return;
        card.showPT = Boolean(card.toughness || card.power);
        const ptBackgrounds = await activeFrame.buildBackgrounds('pt', card);
        this.ptStyle = this.objectToStyle({
            ...ptBackgrounds[0].style,
            opacity: card.showPT ? '1' : '0'
        });
        await this.updateFrontNotchPt(card);
        this.requestRender({ render: 'renderPT' });
    }

    updateFrontNotchPt(card) {
        if (card.id !== 'back') return;
        const frontCard = card.parent().front;
        frontCard.showNotchPT = card.showPT && frontCard?.isTransform();
        frontCard.notchPtText = `${card.power}/${card.toughness}`;
    }

    bind(card, watch) {
        watch(
            () => [card.toughness, card.power, card.activeFrame],
            () => this.updatePT(card)
        );
        watch(
            () => card.showNotchPT,
            () => this.requestRender({ render: 'renderNotchPT' })
        );
    }

    renderPT(card, editable) {
        return (
            `<div class="pt-text" style="${this.ptStyle}">
                ${this.editableText(editable, 'power', null, { 
                    nextKeys: '/' 
                })}
                <span class="divider">/</span>
                ${this.editableText(editable, 'toughness', null, { 
                    prevKeys: 'Backspace' 
                })}
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
