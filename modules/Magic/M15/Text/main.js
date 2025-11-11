export default async function(card, utils) {
    const { textToHTML } = await utils.import('textToHTML.js');
    const flavorBarUrl = await utils.assetURL('grey bar.png');
    card.flavorBarStyle = { backgroundImage: `url("${flavorBarUrl}")` };
    card.forbiddenRects = [];
    card.showFlag = card.showFlag || false;
    card.textToHTML = textToHTML;

    function updateForbiddenRects() {
        const forbiddenRects = [];
        if (card.showPT) {
            const ptContainer = card.dom.querySelector(`.${card.id}-pt-container`);
            const rects = ptContainer.getClientRects();
            forbiddenRects.push(...rects);
        }
        if (card.showStamp) {
            // TODO: stamp rect
        }
        card.forbiddenRects = forbiddenRects;
    }

    Alpine.effect(async () => {
        card.rulesHTML = await textToHTML(card.rulesText, card);
    });

    Alpine.effect(() => {
        card.showFlavorBar = card.flavorText && card.rulesText;
    });

    Alpine.effect(() => {
        if (!utils.subscribe(card.rulesHTML, card.showPT))
            return;
        Alpine.nextTick(() => requestAnimationFrame(updateForbiddenRects));
    });

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
        `<div class="__id__-text" :class="showFlag && 'flag-padding'" x-fit-text="{text: [rulesHTML, flavorHTML], forbiddenRects: forbiddenRects}">
            <div class="rules-text" x-html="rulesHTML"></div>
            <div class="flavor-bar" x-show="showFlavorBar" :style="flavorBarStyle"></div>
            <div class="flavor-text" x-text="flavorText"></div>
        </div>`
    );

    await utils.loadFont('MPlantin-Italic', 'mplantinit.ttf');
    card.addStyle(await utils.loadFile('style.css'));
}
