export default async function(card, utils) {
    card.showPT = true;

    async function updatePtStyle() {
        const key = card.isVehicle() ? 'v' : card.getCardColorKey();
        const url = await utils.assetURL(key + '.png');
        card.ptStyle = { backgroundImage: `url("${url}")` };
    }

    Alpine.effect(() => {
        card.showPT = card.toughness || card.power;
    });

    Alpine.effect(() => {
        if (!card.colorIdentity || card.superType === undefined) return;
        updatePtStyle();
    });

    card.addField({
        id: 'power',
        displayName: 'Power',
        group: 'PT',
    });

    card.addField({
        id: 'toughness',
        displayName: 'Toughness',
        group: 'PT',
    });

    card.publishElement('pt-container',
        `<div class="pt-text" :style="ptStyle">
            <span x-text="power"></span>/<span x-text="toughness"></span>
        </div>`
    );

    card.addStyle(await utils.loadFile('style.css'));
}
