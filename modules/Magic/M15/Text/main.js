export default async function(card, utils) {
    const { textToHTML } = await utils.import('textToHTML.js');
    const flavorBarUrl = await utils.assetURL('grey bar.png');
    card.flavorBarStyle = { backgroundImage: `url("${flavorBarUrl}")` };
    card.forbiddenRects = [];

    function updateForbiddenRects() {
        card.forbiddenRects = [];
        if (card.showPT) {
            const ptContainer = card.dom.querySelector(`.${card.id}-pt-container`);
            card.forbiddenRects.push(...ptContainer.getClientRects());
        }
        if (card.showStamp) {
            // TODO: stamp rect
        }
    }

    Alpine.effect(() => {
        card.rulesHTML = textToHTML(card.rulesText, card);
    });

    Alpine.effect(() => {
        card.showFlavorBar = card.flavorText && card.rulesText;
    });

    Alpine.effect(() => {
        if ((card.showPT || card.showStamp) && card.rulesHTML)
            Alpine.nextTick(updateForbiddenRects);
    })

    card.addField({
        id: 'rulesText',
        type: 'textarea',
        displayName: 'Rules Text'
    });

    card.addField({
        id: 'flavorText',
        type: 'textarea',
        displayName: 'Flavor Text'
    });

    card.publishElement('text-box',
        `<div class="text" x-fit-text="{text: [rulesHTML, flavorText], forbiddenRects}">
            <div class="rules-text" x-html="rulesHTML"></div>
            <div class="flavor-bar" x-show="showFlavorBar" :style="flavorBarStyle"></div>
            <div class="flavor-text" x-text="flavorText"></div>
        </div>`
    );

    await utils.loadFont('MPlantin-Italic', 'mplantinit.ttf');
    card.addStyle(await utils.loadFile('style.css'));
}
