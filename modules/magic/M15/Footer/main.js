const L = localize('module-M15-footer');

export default class FooterModule extends CardMagicianModule {
    async init(card) {
        this.brushSvg = await this.loadFile('assets/art.svg');
        this.collectorNumberField = {
            id: 'collectorNumber',
            label: L`Collector Number`
        };
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

    get fields() {
        const { illustrator, setCode, language, legalText } = activeProject;
        return [
            { id: 'illustrator', label: L`Illustrator`, placeholder: illustrator },
            { id: 'autoCollectorNumber', label: L`Auto Collector Number` },
            this.collectorNumberField,
            { id: 'setCode', label: L`Set Code`, placeholder: setCode },
            { id: 'language', label: L`Language`, placeholder: language },
            { id: 'legalText', label: L`Legal Text`, placeholder: legalText },
            { id: 'showFooterOverrides', default: false }
        ];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
