export default async function(card, utils) {
    function defaultImage(name) {
        return utils.assetURL(name + '.jpg');
    }

    async function getDefaultColorImage(colorCount) {
        if (colorCount === 0)
            return await defaultImage(card.isLand() ? 'l' : 'c');
        if (colorCount === 1)
            return await defaultImage(card.color.c);
        if (colorCount === 2) {
            const imgUrl1 = await defaultImage(card.color.colors[0]);
            const imgUrl2 = await defaultImage(card.color.colors[1]);
            return await utils.combineBlend(imgUrl1, imgUrl2);
        }
        return await defaultImage('m');
    }

    async function getDefaultTypeImage(card) {
        if (card.isLand()) return await defaultImage('l');
        if (card.isMulticolor()) return await defaultImage('m');
        if (card.isArtifact()) return await defaultImage('a');
        return null;
    }

    Alpine.effect(async () => {
        if (card.artImageUrl || !card.color || card.superType === undefined) return;
        const colorCount = card.color.colors.length;
        const colorImage = await getDefaultColorImage(colorCount);
        const typeImage = await getDefaultTypeImage(card);
        card.defaultImageUrl = typeImage
            ? await utils.combineBlend(colorImage, typeImage)
            : colorImage;
    });
}
