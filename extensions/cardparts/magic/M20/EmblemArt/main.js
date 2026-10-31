import ArtModule from '../../M15/Art/main.js';

export default class EmblemArtModule extends ArtModule {
    async init(card) {
        await super.init(card);
        this.defaultImageUrl = this.resolveAsset('default.png');
    }

    bind(card, watch) {
        watch(card, ['artImage'], () => this.requestRender());
    }
}
