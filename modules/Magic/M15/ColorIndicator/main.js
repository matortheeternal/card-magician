export default async function(card, utils) {
    // TODO
    async function getIndicatorImage() {
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
        displayName: 'Color Indicator',
        group: 'manaCost'
    });

    card.publishElement('color-indicator',
        `<img x-show="colorIndicator" :src="colorIdentityImage">`
    );
}
