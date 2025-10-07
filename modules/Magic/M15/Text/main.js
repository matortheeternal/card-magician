const vStart = '87%';
const hStart = '80%';
const ptPolygon = `polygon(${hStart} ${vStart}, 100% ${vStart}, 100% 100%, ${hStart} 100%)`;

export default async function(card, utils) {
    card.rulesHTML = '';
    card.wrapShapeStyle = {
        shapeOutside: ptPolygon,
        clipPath: ptPolygon
    };
    const flavorBarUrl = await utils.assetURL('grey bar.png');
    card.flavorBarStyle = { backgroundImage: `url("${flavorBarUrl}")` };

    Alpine.effect(() => {
        card.wrapShapeStyle = {
            shapeOutside: ptPolygon,
            clipPath: ptPolygon
        };
    });

    Alpine.effect(() => {
        if (!card.rulesText) return;
        card.rulesHTML = card.formatText(card.rulesText);
    });

    Alpine.effect(() => {
        card.showFlavorBar = card.flavorText && card.rulesText;
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

    card.publishElement('.card-text-box',
        `<div class="card-text" x-fit-text="[rulesText, flavorText]">
            <div class="card-text-wrap-shape" :style="wrapShapeStyle"></div>
            <div class="rules-text" x-html="rulesHTML"></div>
            <div class="flavor-bar" x-show="showFlavorBar" :style="flavorBarStyle"></div>
            <div class="flavor-text" x-text="flavorText"></div>
        </div>`
    );

    await utils.loadFont('MPlantin-Italic', 'mplantinit.ttf');
    card.addStyle(await utils.loadFile('style.css'));
}
