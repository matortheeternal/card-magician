export default async function(card, utils) {
    function defaultImage(name) {
        return utils.assetURL(name + '.jpg');
    }

    async function getDefaultColorImage(colorCount) {
        const colors = card.colorIdentity.colors;
        if (colorCount === 0)
            return await defaultImage(card.isLand() ? 'l' : 'c');
        if (colorCount === 1)
            return await defaultImage(card.getCardColorKey());
        if (colorCount === 2) {
            const imgUrl1 = await defaultImage(colors[0].char);
            const imgUrl2 = await defaultImage(colors[1].char);
            return await utils.combineBlend(imgUrl1, imgUrl2);
        }
        return await defaultImage('m');
    }

    async function getDefaultTypeImage(card) {
        if (card.isLand()) return await defaultImage('l');
        if (card.colorIdentity.isMulticolor()) return await defaultImage('m');
        if (card.isArtifact()) return await defaultImage('a');
        return null;
    }

    Alpine.effect(async () => {
        if (card.artImageUrl || !card.colorIdentity || card.superType === undefined)
            return;
        const colorCount = card.colorIdentity.colors.length;
        const colorImage = await getDefaultColorImage(colorCount);
        const typeImage = await getDefaultTypeImage(card);
        card.defaultImageUrl = typeImage
            ? await utils.combineBlend(colorImage, typeImage)
            : colorImage;
    });
}
