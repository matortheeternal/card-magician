export default class FooterModule extends CardMagicianModule {
    async init(card) {
        this.brushSvg = await this.loadFile('assets/art.svg');
        await this.loadFont('Beleren Small Caps Bold', 'belerensmallcaps-bold.ttf');
        await this.loadFont('Relay Medium', 'relay-medium.ttf');
        await this.loadFont('MPlantin', 'mplantin.ttf');
        card.showFooterOverrides = false;
    }

    bind(card, watch) {
        watch(
            () => [
                card.rarityCharacter, card.collectorNumber, card.autoCollectorNumber,
                card.setCode, card.language, card.illustrator
            ],
            () => this.requestRender({ render: 'renderInfo' })
        );
        watch(
            () => card.legalText,
            () => this.requestRender({ render: 'renderLegal' })
        );
    }

    renderInfo(card) {
        const set = this.getActiveSet();
        const setCode = card.setCode || set.info.setCode || '';
        const language = card.language || set.info.language || '';
        const illustrator = card.illustrator || set.info.illustrator || '';

        return (
            `<div>
                <div>${card.collectorNumber || card.autoCollectorNumber || '&nbsp;'}</div>
                <div>${setCode} &bullet; ${language}</div>
            </div>
            <div>
                <div>${card.rarityCharacter}</div>
                <div class="illustrator-container">
                    <div class="illustrator-brush">${this.brushSvg}</div>
                    <div class="illustrator-name">${illustrator}</div>
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
            { id: 'illustrator', displayName: 'Illustrator', placeholder: illustrator },
            { id: 'collectorNumber', displayName: 'Collector Number' },
            { id: 'autoCollectorNumber', displayName: 'Collector Number' },
            { id: 'setCode', displayName: 'Set Code', placeholder: setCode },
            { id: 'language', displayName: 'Language', placeholder: language },
            { id: 'legalText', displayName: 'Legal Text', placeholder: legalText }
        ];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
