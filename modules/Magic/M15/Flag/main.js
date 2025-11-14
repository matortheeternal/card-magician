export default async function(card, utils) {
    card.showFlag = true;
    card.flagStyle = {};

    async function updateFlagStyle() {
        if (!card.colorIdentity || card.superType === undefined) return;
        const key = card.getCardColorKey();
        const folder = card.id === 'back' ? 'back' : 'front';
        const url = await utils.assetURL(`${folder}/${key}.png`);
        card.flagStyle = { backgroundImage: `url("${url}")` };
    }

    function updateShowFlag() {
        if (!utils.subscribe(card.frameFolder, card.parent)) return;
        if (card.id !== 'front') return;
        const showFlag = card.frameFolder !== 'notched';
        card.showFlag = showFlag;
        const backCard = card.parent().back;
        if (backCard) backCard.showFlag = showFlag;
    }

    Alpine.effect(updateShowFlag);
    Alpine.effect(updateFlagStyle);

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
