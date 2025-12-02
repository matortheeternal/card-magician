import NormalFrame from '../../Frame/src/NormalFrame.js';

function resolveAssetPath(path) {
    return new URL(`../assets/${path}`, import.meta.url).pathname;
}

export default class AdventureFrame extends NormalFrame {
    pages = [
        this.resolveBinding,
        this.resolveLeftPage,
        this.resolveRightPage
    ];

    /* --- BINDING --- */
    get bindingUrl() {
        return resolveAssetPath('binding');
    }

    async resolveBinding(card) {
        const imageUrl = await this.coloredBlend(this.bindingUrl, card);
        return this.background('binding', imageUrl, 1);
    }

    /* --- LEFT PAGE --- */
    get leftPageUrl() {
        // TODO: use ${this.card.pageStyle}
        return resolveAssetPath(`page/name_and_type`);
    }

    async resolveLeftPage(card) {
        const adventure = card.subcards.find(s => s.id === 'adventure');
        const imageUrl = await this.coloredBlend(this.leftPageUrl, adventure, {
            hybridMode: 'first',
            ext: '.png'
        });
        return this.background('left-page', imageUrl, 2);
    }

    /* --- RIGHT PAGE --- */
    get rightPageUrl() {
        return resolveAssetPath('page/blank');
    }

    async resolveRightPage(card) {
        const imageUrl = await this.coloredBlend(this.rightPageUrl, card, {
            hybridMode: 'first',
            ext: '.png'
        });
        return this.background('right-page', imageUrl, 2);
    }
}
