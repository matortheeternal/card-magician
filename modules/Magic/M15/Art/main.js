const L = localize('module-M15-art');

const DEFAULT_DIMENSIONS = [311, 228];

export default class ArtModule extends CardMagicianModule {
    async init(card) {
        this.artImageField = {
            id: 'artImage',
            type: 'image',
            label: L`Art Image`
        };

        card.setAspectRatio = ({ width, height }) => {
            this.artImageField.aspectRatio = width / height;
        };
    }

    defaultImageUrl(name) {
        return this.resolveAsset(name + '.jpg');
    }

    getDefaultColorImage(card, colorCount) {
        const colors = card.colorIdentity.colors;
        if (colorCount === 0)
            return this.defaultImageUrl(card.isLand() ? 'l' : 'c');
        if (colorCount === 1)
            return this.defaultImageUrl(card.getCardColorKey());
        if (colorCount === 2) {
            const imgUrl1 = this.defaultImageUrl(colors[0].char);
            const imgUrl2 = this.defaultImageUrl(colors[1].char);
            return this.combineBlend(imgUrl1, imgUrl2);
        }
        return this.defaultImageUrl('m');
    }

    getDefaultTypeImage(card) {
        if (card.isLand())
            return this.defaultImageUrl('l');
        if (card.colorIdentity.isMulticolor())
            return this.defaultImageUrl('m');
        if (card.isArtifact())
            return this.defaultImageUrl('a');
        return null;
    }

    async getDefaultImage(card) {
        const colorCount = card.colorIdentity.colors.length;
        const colorImage = this.getDefaultColorImage(card, colorCount);
        const typeImage = this.getDefaultTypeImage(card);
        if (typeImage) {
            const blendImage = this.combineBlend(colorImage, typeImage);
            return await blendImage.publish();
        }
        return colorImage.publish
            ? await colorImage.publish()
            : colorImage;
    }

    async updateDefaultImage(card) {
        const imageUrl = await this.getDefaultImage(card);
        const ImageFieldValue = card.artImage.constructor;
        card.defaultImage = new ImageFieldValue(imageUrl, '', ...DEFAULT_DIMENSIONS);
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

    render(card, editable) {
        const img = card.artImage.imageUrl ? card.artImage : card.defaultImage;
        if (!img.imageUrl) return '';
        const { aspectRatio } = this.artImageField;
        return this.editableImage(editable, 'artImage', aspectRatio, (
            `<crop-image
                crop-width="${img.crop.width}"
                crop-height="${img.crop.height}"
                offset-x="${img.crop.xOffset}"
                offset-y="${img.crop.yOffset}"
                image-width="${img.width}"
                image-height="${img.height}"
                filename="${img.filename}"
                src="${img.imageUrl}"
            ></crop-image>`
        ));
    }

    get fields() {
        return [this.artImageField];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
