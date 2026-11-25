const L = localize('module-M15-footer');

export default class FooterModule extends CardMagicianModule {
    static createFields() {
        return [
            { id: 'illustrator', label: L`Illustrator` },
            { id: 'autoCollectorNumber', label: L`Auto Collector Number` },
            { id: 'collectorNumber', label: L`Collector Number` },
            { id: 'setCode', label: L`Set Code` },
            { id: 'language', label: L`Language` },
            { id: 'legalText', label: L`Legal Text` },
            { id: 'showFooterOverrides', default: false }
        ];
    }

    async init() {
        this.initFieldPlaceholders();
        this.brushSvg = await this.loadFile('assets/art.svg');
    }

    initFieldPlaceholders() {
        const fields = Object.fromEntries(
            this.fields.map(field => [field.id, field])
        );
        fields.illustrator.placeholder = activeProject.illustrator;
        fields.setCode.placeholder = activeProject.setCode;
        fields.language.placeholder = activeProject.language;
        fields.legalText.placeholder = activeProject.legalText;
        this.collectorNumberField = fields.collectorNumber;
    }

    updateCollectorNumberPlaceholder(card) {
        this.collectorNumberField.placeholder = card.autoCollectorNumber;
        changed(this.collectorNumberField, 'placeholder');
    }

    bind(card, watch) {
        watch(card, [
            'rarityCharacter', 'autoCollectorNumber', 'collectorNumber',
            'setCode', 'language', 'illustrator'
        ], () => this.requestRender({ render: 'renderInfo' }));
        watch(activeProject, ['rarityOrder', 'language', 'illustrator', 'setCode'],
              () => this.requestRender({ render: 'renderInfo' })
        );
        watch(card, 'legalText', () => this.requestRender({ render: 'renderLegal' }));
        watch(card, 'autoCollectorNumber',
              () => this.updateCollectorNumberPlaceholder(card)
        );
    }

    renderSetCodeAndLanguage(card) {
        const setCode = this.escapeHTML(card.setCode || activeProject.setCode || '');
        const language = this.escapeHTML(card.language || activeProject.language || '');
        return `<div>${setCode} &bullet; ${language}</div>`;
    }

    renderIllustrator(card) {
        const illustrator = this.escapeHTML(
            card.illustrator || activeProject.illustrator || ''
        );

        if (!illustrator) return `<div></div>`;
        return (
            `<div class="illustrator-container">
                <div class="illustrator-brush">${this.brushSvg}</div>
                <div class="illustrator-name">${illustrator}</div>
            </div>`
        );
    }

    renderInfo(card) {
        const number = card.collectorNumber || card.autoCollectorNumber || '';

        return activeProject.rarityOrder === 'after' ? (
            `<div class="column">
                <div>${this.escapeHTML(number)}</div>
                ${this.renderSetCodeAndLanguage(card)}
            </div>
            <div class="column">
                <div>${card.rarityCharacter}</div>
                ${this.renderIllustrator(card)}
            </div>`
        ) : (
            `<div class="row">
                <div>${card.rarityCharacter}</div>
                <div>${this.escapeHTML(number)}</div>
            </div>
            <div class="row">
                ${this.renderSetCodeAndLanguage(card)}
                ${this.renderIllustrator(card)}
            </div>`
        );
    }

    renderLegal(card) {
        return card.legalText || activeProject.legalText;
    }
}
