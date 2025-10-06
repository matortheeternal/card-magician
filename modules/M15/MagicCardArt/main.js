export default async function(card, utils) {
    card.artImageUrl = '';
    card.showArtImage = false;

    function defaultImage(name) {
        return utils.assetURL(name + '.jpg');
    }

    async function getDefaultColorImage(colorCount) {
        if (colorCount === 0)
            return await defaultImage(card.isLand() ? 'land' : 'colorless');
        if (colorCount === 1)
            return await defaultImage(card.color.color);
        if (colorCount === 2) {
            const imgUrl1 = await defaultImage(card.color.colors[0]);
            const imgUrl2 = await defaultImage(card.color.colors[1]);
            return await utils.combineBlend(imgUrl1, imgUrl2);
        }
        return await defaultImage('multicolor');
    }

    async function getDefaultTypeImage(card) {
        if (card.isLand()) return await defaultImage('land');
        if (card.isMulticolor()) return await defaultImage('gold');
        if (card.isArtifact()) return await defaultImage('artifact');
        return null;
    }

    Alpine.effect(async () => {
        if (card.artImageUrl || !card.color || card.superType === undefined) return;
        const colorCount = card.color.c.length;
        const colorImage = await getDefaultColorImage(colorCount);
        const typeImage = await getDefaultTypeImage(card);
        card.defaultImageUrl = typeImage
            ? await utils.combineBlend(colorImage, typeImage)
            : colorImage;
    });

    card.updateArtImage = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        utils.disposeImage(card, 'artImageUrl');
        card.artImageUrl = URL.createObjectURL(file);
        card.showArtImage = true;
    };

    card.addField({
        id: 'artImage',
        type: 'file',
        displayName: 'Art Image',
        save: async () => {
            if (!card.artImageUrl) return null;
            const response = await fetch(card.artImageUrl);
            const blob = await response.blob();
            return await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('Failed to read data stream.'));
                reader.readAsDataURL(blob);
            });
        },
        load: async (cardData) => {
            utils.disposeImage(card, 'artImageUrl');
            if (!cardData.artImage) return null;
            const blob = utils.parseBlob(cardData.artImage);
            card.artImageUrl = URL.createObjectURL(blob);
            card.showArtImage = true;
            return '';
        },
        onChange: 'updateArtImage($event)'
    });

    card.publishElement('.card-art-image',
        `<img x-show="showArtImage" :src="artImageUrl" alt="Card Art" />
         <img x-show="!showArtImage" :src="defaultImageUrl" alt="Placeholder image" />`
    );

    card.addStyle(await utils.loadFile('style.css'));
}
