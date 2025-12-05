export default class FooterModule extends CardMagicianModule {
    async init(card) {
        this.brushSvg = await this.loadFile('assets/art.svg');
        this.collectorNumberField = {
            id: 'collectorNumber',
            label: 'Collector Number'
        };

        await this.loadFont('Beleren Small Caps Bold', 'belerensmallcaps-bold.ttf');
        await this.loadFont('Relay Medium', 'relay-medium.ttf');
        await this.loadFont('MPlantin', 'mplantin.ttf');
        card.showFooterOverrides = false;
    }

    bind(card, watch) {
        watch(
            () => [
                card.rarityCharacter, card.autoCollectorNumber, card.collectorNumber,
                card.setCode, card.language, card.illustrator
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
        const set = this.getActiveSet();

        const setCode = card.setCode || set.info.setCode || '';
        const language = card.language || set.info.language || '';
        const illustrator = card.illustrator || set.info.illustrator || '';
        const number = card.collectorNumber || card.autoCollectorNumber || '';

        return (
            `<div>
                <div>${this.escapeHTML(number)}</div>
                <div>${this.escapeHTML(setCode)} &bullet; ${this.escapeHTML(language)}</div>
            </div>
            <div>
                <div>${card.rarityCharacter}</div>
                <div class="illustrator-container">
                    <div class="illustrator-brush">${this.brushSvg}</div>
                    <div class="illustrator-name">${this.escapeHTML(illustrator)}</div>
                </div>
            </div>`
        );
    }

    renderLegal(card) {
        const set = this.getActiveSet();
        return card.legalText || set.info.legalText;
    }

    get fields() {
        const setInfo = this.getActiveSet()?.info || {};
        const { illustrator, setCode, language, legalText } = setInfo;
        return [
            { id: 'illustrator', label: 'Illustrator', placeholder: illustrator },
            { id: 'autoCollectorNumber', label: 'Auto Collector Number' },
            this.collectorNumberField,
            { id: 'setCode', label: 'Set Code', placeholder: setCode },
            { id: 'language', label: 'Language', placeholder: language },
            { id: 'legalText', label: 'Legal Text', placeholder: legalText }
        ];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
