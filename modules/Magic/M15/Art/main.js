export default class ArtModule extends CardMagicianModule {
    defaultImage(name) {
        return this.assetURL(name + '.jpg');
    }

    async getDefaultColorImage(card, colorCount) {
        const colors = card.colorIdentity.colors;
        if (colorCount === 0)
            return await this.defaultImage(card.isLand() ? 'l' : 'c');
        if (colorCount === 1)
            return await this.defaultImage(card.getCardColorKey());
        if (colorCount === 2) {
            const imgUrl1 = await this.defaultImage(colors[0].char);
            const imgUrl2 = await this.defaultImage(colors[1].char);
            return await this.combineBlend(imgUrl1, imgUrl2);
        }
        return await this.defaultImage('m');
    }

    async getDefaultTypeImage(card) {
        if (card.isLand())
            return await this.defaultImage('l');
        if (card.colorIdentity.isMulticolor())
            return await this.defaultImage('m');
        if (card.isArtifact())
            return await this.defaultImage('a');
        return null;
    }

    async updateDefaultImage(card) {
        const colorCount = card.colorIdentity.colors.length;
        const colorImage = await this.getDefaultColorImage(card, colorCount);
        const typeImage = await this.getDefaultTypeImage(card);
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
        const src = card.artImage.image || card.defaultImageUrl;
        if (!src) return '';
        return (`<img src="${src}" />`);
    }

    get fields() {
        return [{
            id: 'artImage',
            type: 'image',
            displayName: 'Art Image',
            default: {
                image: null,
                filename: '',
                width: '',
                height: '',
                xOffset: 0,
                yOffset: 0,
            }
        }];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
