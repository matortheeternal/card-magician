import FooterModule from '../../M15/Footer/main.js';

export default class ClassicFooterModule extends FooterModule {
    async init() {
        this.initFieldPlaceholders();
    }

    bind(card, watch) {
        super.bind(card, watch);
        watch(card, ['collectorNumber', 'autoCollectorNumber'],
              () => this.requestRender({ render: 'renderLegal' })
        );
    }

    renderInfo(card) {
        return this.escapeHTML(card.illustrator || activeProject.illustrator || '');
    }

    renderLegal(card) {
        const number = card.collectorNumber || card.autoCollectorNumber;
        return [super.renderLegal(card), this.escapeHTML(number || '')]
            .filter(Boolean)
            .join(' ');
    }
}
