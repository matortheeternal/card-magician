export default async function(card, utils) {
    card.showFlag = true;

    async function updateFlagStyle() {
        const key = card.getCardColorKey();
        const folder = card.id === 'back' ? 'back' : 'front';
        const url = await utils.assetURL(`${folder}/${key}.png`);
        card.flagStyle = { backgroundImage: `url("${url}")` };
    }

    Alpine.effect(() => {
        const frontCard = card.parent().front;
        card.showFlag = frontCard && frontCard.frameFolder !== 'notched'
    });

    Alpine.effect(() => {
        if (!card.colorIdentity || card.superType === undefined) return;
        updateFlagStyle();
    });

    Alpine.effect(() => {
        if (card.flagRight === undefined) return;
        card.flagRightHTML = card.textToHTML(card.flagRight, card);
    });

    card.addField({
        id: 'flagLeft',
        displayName: 'Flag Left',
        group: 'flag',
    });

    card.addField({
        id: 'flagRight',
        displayName: 'Flag Right',
        group: 'flag',
    });

    card.publishElement('flag-container',
        `<div class="__id__-flag" :style="flagStyle">
            <div class="flag-left" x-text="flagLeft"></div>
            <div class="flag-right" x-html="flagRightHTML"></div>
        </div>`
    );

    card.addStyle(await utils.loadFile('style.css'));
}
