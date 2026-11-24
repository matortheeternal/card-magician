import FooterModule from '../../M15/Footer/main.js';

export default class ClassicFooterModule extends FooterModule {
    async init() {
        this.initFieldPlaceholders();
    }

    renderInfo(card) {
        return this.escapeHTML(card.illustrator || activeProject.illustrator || '');
    }
}
