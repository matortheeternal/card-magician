const L = localize('module-M15-footer');

export default class FooterModule extends CardMagicianModule {
    async init(card) {
        this.brushSvg = await this.loadFile('assets/art.svg');
        this.collectorNumberField = {
            id: 'collectorNumber',
            label: L`Collector Number`
        };
        this.set = this.getActiveSet();

        await this.loadFont('Beleren Small Caps Bold', 'belerensmallcaps-bold.ttf');
        await this.loadFont('Relay Medium', 'relay-medium.ttf');
        await this.loadFont('MPlantin', 'mplantin.ttf');
    }

    bind(card, watch) {
        watch(
            () => [
                card.rarityCharacter, card.autoCollectorNumber, card.collectorNumber,
                card.setCode, card.language, card.illustrator, this.set.info.rarityOrder,
                this.set.info.language, this.set.info.illustrator, this.set.info.setCode
            ],
            () => this.requestRender({ render: 'renderInfo' })
        );
        watch(
            () => card.legalText,
            () => this.requestRender({ render: 'renderLegal' })
        );
        watch(
            () => card.autoCollectorNumber,
            () => (this.collectorNumberField.placeholder = card.autoCollectorNumber)
        );
    }

    renderInfo(card) {
        const setCode = card.setCode || this.set.info.setCode || '';
        const language = card.language || this.set.info.language || '';
        const illustrator = card.illustrator || this.set.info.illustrator || '';
        const number = card.collectorNumber || card.autoCollectorNumber || '';

        return this.set.info.rarityOrder === 'after' ? (
            `<div class="column">
                <div>${this.escapeHTML(number)}</div>
                <div>${this.escapeHTML(setCode)} &bullet; ${this.escapeHTML(language)}</div>
            </div>
            <div class="column">
                <div>${card.rarityCharacter}</div>
                <div class="illustrator-container">
                    <div class="illustrator-brush">${this.brushSvg}</div>
                    <div class="illustrator-name">${this.escapeHTML(illustrator)}</div>
                </div>
            </div>`
        ) : (
            `<div class="row">
                <div>${card.rarityCharacter}</div>
                <div>${this.escapeHTML(number)}</div>
            </div>
            <div class="row">
                <div>${this.escapeHTML(setCode)} &bullet; ${this.escapeHTML(language)}</div>
                <div class="illustrator-container">
                    <div class="illustrator-brush">${this.brushSvg}</div>
                    <div class="illustrator-name">${this.escapeHTML(illustrator)}</div>
                </div>
            </div>`
        );
    }

    renderLegal(card) {
        return card.legalText || this.set.info.legalText;
    }

    get fields() {
        const { illustrator, setCode, language, legalText } = this.set.info;
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
