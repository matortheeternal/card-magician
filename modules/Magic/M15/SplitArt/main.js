import ArtModule from '../Art/main.js';

export default class SplitArtModule extends ArtModule {
    defaultImage(name) {
        return `modules/Magic/M15/Art/assets/${name}.jpg`;
    }

    async updateTopDefaultImage(card) {
        card.defaultTopImageUrl = await this.getDefaultImage(card.top);
        this.requestRender({ render: 'renderTop' });
    }

    async updateBottomDefaultImage(card) {
        card.defaultBottomImageUrl = await this.getDefaultImage(card.bottom);
        this.requestRender({ render: 'renderBottom' });
    }

    bind(card, watch) {
        watch(card.top, ['colorIdentity', 'superType'],
              () => this.updateTopDefaultImage(card));
        watch(card.bottom, ['colorIdentity', 'superType'],
              () => this.updateBottomDefaultImage(card));
        watch(card, ['artImage'], () => {
            this.requestRender({ render: 'renderTop' });
            this.requestRender({ render: 'renderBottom' });
        });
    }

    renderTop(card) {
        if (!card.defaultTopImageUrl && !card.artImage.imageUrl) return '';
        return card.artImage.imageUrl ? (
            `<crop-image crop-width="${card.artImage.crop.width / 2 - 15}"
                         crop-height="${card.artImage.crop.height}"
                         offset-x="${card.artImage.crop.width / 2 + 15}"
                         offset-y="${card.artImage.crop.yOffset}"
                         src="${card.artImage.imageUrl}">
            </crop-image>`
        ) : `<img src="${card.defaultTopImageUrl}" />`;
    }

    renderBottom(card) {
        if (!card.defaultBottomImageUrl && !card.artImage.imageUrl) return '';
        return card.artImage.imageUrl ? (
            `<crop-image crop-width="${card.artImage.crop.width / 2 - 15}"
                         crop-height="${card.artImage.crop.height}"
                         offset-x="${card.artImage.crop.xOffset}"
                         offset-y="${card.artImage.crop.yOffset}"
                         src="${card.artImage.imageUrl}">
            </crop-image>`
        ) : `<img src="${card.defaultBottomImageUrl}" />`;
    }
}
