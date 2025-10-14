export default async function(card, utils) {
    card.isLegendary = function() {
        return /legendary/i.test(card.superType);
    };

    card.isLand = function() {
        return /land/i.test(card.superType);
    };

    card.isArtifact = function() {
        return /artifact/i.test(card.superType);
    };

    card.isEnchantment = function() {
        return /enchantment/i.test(card.superType);
    };

    card.isVehicle = function() {
        return /vehicle/i.test(card.subType);
    };

    card.isSnow = function() {
        return /snow/i.test(card.superType);
    };

    card.addField({
        id: 'superType',
        displayName: 'Super Type',
        group: 'typeLine'
    });

    card.addField({
        id: 'subType',
        displayName: 'Sub Type',
        group: 'typeLine'
    });

    card.publishElement('type',
        `<div class="type-text" x-fit-text="{text: [face.superType, face.subType]}">
            <span x-text="face.superType"></span>
            <span x-show="face.subType">&nbsp;—&nbsp;</span>
            <span x-text="face.subType"></span>
        </div>`
    );

    card.addStyle(await utils.loadFile('style.css'));
}
