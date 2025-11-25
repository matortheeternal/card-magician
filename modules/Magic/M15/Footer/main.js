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
                card.rarityCharacter, card.collectorNumber,
                card.setCode, card.language,card.illustrator
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
                <div>${card.collectorNumber || '&nbsp;'}</div>
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
        const set = this.getActiveSet();
        return [{
            id: 'illustrator',
            displayName: 'Illustrator',
            group: 'footer',
            placeholder: set.info.illustrator
        }, {
            id: 'collectorNumber',
            displayName: 'Collector Number',
            group: 'footer-ext'
        }, {
            id: 'setCode',
            displayName: 'Set Code',
            group: 'footer-ext',
            placeholder: set.info.setCode
        }, {
            id: 'language',
            displayName: 'Language',
            group: 'footer-ext',
            placeholder: set.info.language
        }, {
            id: 'legalText',
            displayName: 'Legal Text',
            group: 'footer-ext',
            placeholder: set.info.legalText
        }];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
