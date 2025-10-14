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
            <div x-text="face.rarityCharacter"></div>
            <div x-text="face.collectorNumber"></div>
        </div>
        <div>
            <div x-text="face.setCode"></div>
            <div>&bullet;</div>
            <div x-text="face.language"></div>
            <div class="illustrator-brush" x-html="face.brushSvg"></div>
            <div class="illustrator-name" x-text="face.illustrator"></div>
        </div>`
    );

    card.publishElement('legal-text',
        `<span x-text="face.legalText"></span>`
    );

    await utils.loadFont('Beleren Small Caps Bold', 'belerensmallcaps-bold.ttf');
    await utils.loadFont('Relay Medium', 'relay-medium.ttf');
    await utils.loadFont('MPlantin', 'mplantin.ttf');
    card.addStyle(await utils.loadFile('style.css'));
}
