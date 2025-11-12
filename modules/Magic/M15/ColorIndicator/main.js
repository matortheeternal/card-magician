export default async function(card, utils) {
    async function getIndicatorImage() {
        if (!card.colorIndicator) return '';
        const colors = card.colorIdentity.colors;
        if (colors.length === 1) {
            const key = card.getCardColorKey();
            return await utils.assetURL(`indicator/${key}.png`);
        }
        if (colors.length === 2) {
            const [c1, c2] = colors;
            const img1 = await utils.assetURL(`indicator/${c1.char}.png`);
            const img2 = await utils.assetURL(`indicator/${c2.char}.png`);
            return await utils.linearBlend(img1, img2, 0.5, 0.5, 0.499, 0.499);
        }
        return '';
    }

    async function processColorIdentityOverride() {
        if (!utils.subscribe(card.colorIndicator, card.colorIdentity))
            return;
        card.colorIdentity.setOverride(card.colorIndicator);
        card.colorIdentityImage = await getIndicatorImage();
    }

    Alpine.effect(processColorIdentityOverride);

    card.addField({
        id: 'colorIndicator',
        displayName: 'Color (Override)',
        group: 'manaCost'
    });

    card.publishElement('color-indicator',
        `<img x-show="colorIndicator" :src="colorIdentityImage">`
    );
}
