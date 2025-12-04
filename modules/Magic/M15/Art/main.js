export default class ArtModule extends CardMagicianModule {
    async init(card) {
        this.artImageField = {
            id: 'artImage',
            type: 'image',
            label: 'Art Image'
        };

        card.setAspectRatio = ({ width, height }) => {
            this.artImageField.aspectRatio = width / height;
        };
    }

    defaultImage(name) {
        return this.resolveAsset(name + '.jpg');
    }

    async getDefaultColorImage(card, colorCount) {
        const colors = card.colorIdentity.colors;
        if (colorCount === 0)
            return this.defaultImage(card.isLand() ? 'l' : 'c');
        if (colorCount === 1)
            return this.defaultImage(card.getCardColorKey());
        if (colorCount === 2) {
            const imgUrl1 = this.defaultImage(colors[0].char);
            const imgUrl2 = this.defaultImage(colors[1].char);
            return await this.combineBlend(imgUrl1, imgUrl2);
        }
        return this.defaultImage('m');
    }

    getDefaultTypeImage(card) {
        if (card.isLand())
            return this.defaultImage('l');
        if (card.colorIdentity.isMulticolor())
            return this.defaultImage('m');
        if (card.isArtifact())
            return this.defaultImage('a');
        return null;
    }

    async updateDefaultImage(card) {
        const colorCount = card.colorIdentity.colors.length;
        const colorImage = await this.getDefaultColorImage(card, colorCount);
        const typeImage = this.getDefaultTypeImage(card);
        card.defaultImageUrl = typeImage
            ? await this.combineBlend(colorImage, typeImage)
            : colorImage;
        this.requestRender();
    }

    bind(card, watch) {
        watch(
            () => [card.colorIdentity, card.superType],
            () => this.updateDefaultImage(card)
        );
        watch(
            () => card.artImage,
            () => this.requestRender()
        );
    }

    render(card) {
        if (!card.defaultImageUrl && !card.artImage.imageUrl) return '';
        return card.artImage.imageUrl ? (
            `<crop-image crop-width="${card.artImage.crop.width}" 
                         crop-height="${card.artImage.crop.height}"
                         offset-x="${card.artImage.crop.xOffset}"
                         offset-y="${card.artImage.crop.yOffset}"
                         src="${card.artImage.imageUrl}">
            </crop-image>`
        ) : `<img src="${card.defaultImageUrl}" />`;
    }

    get fields() {
        return [this.artImageField];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
