export default async function(card, utils) {
    card.backgrounds = [];

    async function background(assetPath, zIndex) {
        const url = await utils.assetURL(assetPath);
        return { backgroundImage: `url("${url}")`, zIndex };
    }

    async function maskedBackground(imgUrl, maskUrl, zIndex, backgroundColor = 'black') {
        const url = await utils.maskImage(imgUrl, maskUrl);
        return { backgroundImage: `url("${url}")`, backgroundColor, zIndex };
    }

    async function getLegendBackgrounds(color, c) {
        return [
            await background(`legend/${c}crown.png`, -8),
            await maskedBackground(
                await utils.assetURL(`cards/${color}card.jpg`),
                await utils.assetURL(`masks/crown_mask.png`),
                -10
            )
        ];
    }

    card.updateBackground = async function() {
        const { color, c } = card.getColorIdentity();
        card.backgrounds = card.isLegendary()
            ? await getLegendBackgrounds(color, c)
            : [await background(`cards/${color}card.jpg`, -10)];
    }

    Alpine.effect(() => {
        if (!card.getColorIdentity || !card.isLegendary) return;
        card.updateBackground(card.color);
    });

    card.setFrame(await utils.loadFile('frame.html'));
    card.addStyle(await utils.loadFile('frame.css'));
}
