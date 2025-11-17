export default class FooterModule extends CardMagicianModule {
    async init() {
        this.brushSvg = await this.loadFile('assets/art.svg');
        await this.loadFont('Beleren Small Caps Bold', 'belerensmallcaps-bold.ttf');
        await this.loadFont('Relay Medium', 'relay-medium.ttf');
        await this.loadFont('MPlantin', 'mplantin.ttf');
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
        return (
            `<div>
                <div>${card.rarityCharacter}</div>
                <div>${card.collectorNumber}</div>
            </div>
            <div>
                <div>${card.setCode}</div>
                <div>&bullet;</div>
                <div>${card.language}</div>
                <div class="illustrator-brush">${this.brushSvg}</div>
                <div class="illustrator-name">${card.illustrator}</div>
            </div>`
        );
    }

    renderLegal(card) {
        return card.legalText;
    }

    get fields() {
        return [{
            id: 'illustrator',
            displayName: 'Illustrator',
            group: 'footer'
        }, {
            id: 'collectorNumber',
            displayName: 'Collector Number',
            group: 'footer-ext'
        }, {
            id: 'setCode',
            displayName: 'Set Code',
            group: 'footer-ext'
        }, {
            id: 'language',
            displayName: 'Language',
            group: 'footer-ext'
        }, {
            id: 'legalText',
            displayName: 'Legal Text',
            group: 'footer-ext'
        }];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
