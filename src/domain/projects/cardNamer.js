import sanitize from 'sanitize-filename';

function addCardBaseName(card, usedBaseNames) {
    const base = sanitize(card.name.normalize('NFC'), {
        replacement: '-'
    }).replaceAll(' - ', '--'); // this protects us against image suffix collisions
    let name = base;
    let i = 2;
    while (usedBaseNames.includes(name.toLowerCase()))
        name = `${base}-${i++}`;
    usedBaseNames.push(name.toLowerCase());
    card.baseName = name;
}

export function updateBaseNames(cards) {
    const baseNames = [];
    cards.map(card => addCardBaseName(card, baseNames));
    return baseNames;
}

export function updateBaseName(card) {
    const cards = activeProject.cards.slice();
    cards.remove(card);
    const usedBaseNames = cards.map(card => card.baseName.toLowerCase());
    addCardBaseName(card, usedBaseNames);
}
