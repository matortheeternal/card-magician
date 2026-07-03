import { getActiveGame } from '../game/gameManager.js';
import sanitize from 'sanitize-filename';

function addCardBaseName(card, usedBaseNames) {
    const game = getActiveGame();
    const cardName = game.getCardName(card);
    const base = sanitize(cardName.normalize('NFC'), {
        replacement: '-'
    });
    let name = base;
    let i = 2;
    while (usedBaseNames.includes(name))
        name = `${base}-${i++}`;
    usedBaseNames.push(name);
    if(card.baseName && card.baseName !== name)
        card.oldBaseName = card.baseName;
    card.baseName = name;
}

export function updateBaseNames(cards) {
    const baseNames = [];
    cards.map(card => addCardBaseName(card, baseNames));
    return baseNames;
}
