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

    /* --- FRAME --- */
    get frameId() {
        return this.card.frame === 'reversed'
            ? 'reversed'
            : 'adventure';
    }

    /* --- BINDING --- */
    get bindingUrl() {
        return resolveAssetPath('binding');
    }

    async resolveBinding(card) {
        const image = this.coloredBlend(this.bindingUrl, card);
        return await this.background('binding', image, 1);
    }

    /* --- LEFT PAGE --- */
    get leftPageUrl() {
        return resolveAssetPath(`page/${this.card.pageStyle || 'name_and_type'}`);
    }

    async resolveLeftPage(card) {
        const adventure = card.subcards.find(s => s.id === 'adventure');
        const image = this.coloredBlend(this.leftPageUrl, adventure, {
            hybridMode: 'first',
            ext: '.png'
        });
        return await this.background('left-page', image, 2);
    }

    /* --- RIGHT PAGE --- */
    get rightPageUrl() {
        return resolveAssetPath('page/blank');
    }

    async resolveRightPage(card) {
        const image = this.coloredBlend(this.rightPageUrl, card, {
            hybridMode: 'first',
            ext: '.png'
        });
        return await this.background('right-page', image, 2);
    }
}
