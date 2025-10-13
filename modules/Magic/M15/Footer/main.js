export default async function(card, utils) {
    card.brushSvg = await utils.loadFile('assets/art.svg');

    card.addField({
        id: 'illustrator',
        displayName: 'Illustrator',
        group: 'footer'
    });

    card.addField({
        id: 'collectorNumber',
        displayName: 'Collector Number',
        group: 'footer-ext'
    });

    card.addField({
        id: 'setCode',
        displayName: 'Set Code',
        group: 'footer-ext'
    });

    card.addField({
        id: 'language',
        displayName: 'Language',
        group: 'footer-ext'
    });

    card.addField({
        id: 'legalText',
        displayName: 'Legal Text',
        group: 'footer-ext'
    });

    card.publishElement('info',
        `<div>
            <div x-text="rarityCharacter"></div>
            <div x-text="collectorNumber"></div>
        </div>
        <div>
            <div x-text="setCode"></div>
            <div>&bullet;</div>
            <div x-text="language"></div>
            <div class="illustrator-brush" x-html="brushSvg"></div>
            <div class="illustrator-name" x-text="illustrator"></div>
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
