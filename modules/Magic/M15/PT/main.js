export default async function(card, utils) {
    card.notchPtText = '';
    card.showPT = true;
    card.showNotchPT = false;

    function updateShowPt() {
        card.showPT = Boolean(card.toughness || card.power);
    }

    function updateFrontNotchPt() {
        if (card.id !== 'back') return;
        const frontCard = card.parent().front;
        frontCard.showNotchPT = card.showPT && frontCard.frameFolder === 'notched';
        frontCard.notchPtText = `${card.power}/${card.toughness}`;
    }

    async function updatePtStyle() {
        const key = card.isVehicle() ? 'v' : card.getCardColorKey();
        const url = await utils.assetURL(key + '.png');
        card.ptStyle = { backgroundImage: `url("${url}")` };
    }

    Alpine.effect(updateShowPt);
    Alpine.effect(updateFrontNotchPt);
    Alpine.effect(updatePtStyle);

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

    card.publishElement('notch-pt-container',
        `<div class="notch-pt-text">
            <span x-text="notchPtText"></span>
         </div>`
    );

    card.addStyle(await utils.loadFile('style.css'));
}
