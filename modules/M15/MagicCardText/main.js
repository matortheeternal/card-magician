export default async function(card, utils) {
    card.rulesHTML = '';

    card.rulesTextUpdated = function() {
        card.rulesHTML = card.formatText(card.rulesText);
    };

    card.addField({
        id: 'rulesText',
        type: 'textarea',
        displayName: 'Rules Text',
        onChange: 'rulesTextUpdated()'
    });

    card.addField({
        id: 'flavorText',
        type: 'textarea',
        displayName: 'Flavor Text'
    });

    card.publishElement('.card-text-box',
        `<div class="card-text" x-fit-text="[rulesText, flavorText]">
            <div class="rules-text" x-html="rulesHTML"></div>
            <div class="flavor-text" x-text="flavorText"></div>
        </div>`
    );

    card.addStyle(await utils.loadFile('style.css'));
}
