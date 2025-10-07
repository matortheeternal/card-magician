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

    card.addField({
        id: 'superType',
        displayName: 'Super Type'
    });

    card.addField({
        id: 'subType',
        displayName: 'Sub Type'
    });

    card.publishElement('.card-type',
        `<div class="type-text" x-fit-text="[superType, subType]">
            <span x-text="superType"></span>
            <span x-show="subType">&nbsp;—&nbsp;</span>
            <span x-text="subType"></span>
        </div>`
    );

    card.addStyle(await utils.loadFile('style.css'));
}
