const colorNames = {
    g: 'green',
    w: 'white',
    r: 'red',
    b: 'black',
    u: 'blue'
};

function getColorlessIdentity(superType) {
    return superType.includes('Artifact')
        ? { c: 'a', color: 'artifact' }
        : { c: 'c', color: 'colorless' };
}

export default async function(card, utils) {
    card.manaCostHTML = '';
    card.color = getColorlessIdentity('');

    card.getColors = function() {
        let colorChars = card.manaCost.toLowerCase().split('')
            .filter(char => 'wubrg'.includes(char));
        return [...new Set(colorChars)];
    };

    card.getColorIdentity = function() {
        const colors = card.getColors();
        if (colors.length === 0)
            return getColorlessIdentity(card.superType);
        if (colors.length === 1)
            return { c: colors[0], color: colorNames[colors[0]] };
        return { c: 'm', color: 'gold' };
    };

    card.updateManaCost = async function() {
        Alpine.nextTick(async () => {
            card.manaCostHTML = await card.generateSymbols(card.manaCost, true);
            card.color = card.getColorIdentity();
        });
    };

    card.addField({
        id: 'manaCost',
        displayName: 'Mana Cost',
        onChange: 'updateManaCost()'
    });

    card.publishElement('.card-mana-cost',
        `<span x-html="manaCostHTML"></span>`
    );

    card.addStyle(await utils.loadFile('style.css'));
}
