import FooterModule from '../../M15/Footer/main.js';

const L = localize('module-classic-footer');

export default class ClassicFooterModule extends FooterModule {
    async init() {
        this.initFieldPlaceholders();
    }

    bind(card, watch) {
        super.bind(card, watch);
        watch(card, ['collectorNumber', 'autoCollectorNumber'],
              () => this.requestRender({ render: 'renderLegal' })
        );
        watch(card, 'activeFrame', () => this.requestRender({ render: 'renderInfo' }));
    }

    illustratorCredit(card, illustrator) {
        if (!card.activeFrame?.().showIllustratorLabel) return illustrator;
        return L`Illus. ${illustrator}`;
    }

    renderInfo(card) {
        const illustrator = card.illustrator || activeProject.illustrator || '';
        if (!illustrator) return '';
        return this.escapeHTML(this.illustratorCredit(card, illustrator));
    }

    renderLegal(card) {
        const number = card.collectorNumber || card.autoCollectorNumber;
        return [super.renderLegal(card), this.escapeHTML(number || '')]
            .filter(Boolean)
            .join(' ');
    }
}
