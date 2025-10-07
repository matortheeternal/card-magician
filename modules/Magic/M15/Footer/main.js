export default async function(card, utils) {
    card.brushUrl = await utils.assetURL('art.png');

    card.addField({
        id: 'collectorNumber',
        displayName: 'Collector Number'
    });

    card.addField({
        id: 'setCode',
        displayName: 'Set Code'
    });

    card.addField({
        id: 'language',
        displayName: 'Language'
    });

    card.addField({
        id: 'illustrator',
        displayName: 'Illustrator'
    });

    card.addField({
        id: 'legalText',
        displayName: 'Legal Text'
    });

    card.publishElement('info',
        `<div>
            <span x-text="rarityCharacter"></span>
            <span x-text="collectorNumber"></span>
        </div>
        <div>
            <span x-text="setCode"></span>
            <span>&bullet;</span>
            <span x-text="language"></span>
            <img class="illustrator-brush" :src="brushUrl" />
            <span class="illustrator-name" x-text="illustrator"></span>
        </div>`
    );

    card.publishElement('legal-text',
        `<span x-text="legalText"></span>`
    );

    await utils.loadFont('Beleren Small Caps Bold', 'belerensmallcaps-bold.ttf');
    await utils.loadFont('Relay Medium', 'relay-medium.ttf');
    await utils.loadFont('MPlantin', 'mplantin.ttf');
    card.addStyle(await utils.loadFile('style.css'));
}
