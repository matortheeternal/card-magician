import { getActiveGame } from '../game/gameManager.js';
import sanitize from 'sanitize-filename';
import { getActiveSet } from './setManager.js';

function addCardBaseName(card, usedBaseNames) {
    const game = getActiveGame();
    const cardName = game.getCardName(card);
    const base = sanitize(cardName.normalize('NFC'), {
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
    const activeSet = getActiveSet();
    const cards = activeSet.cards.slice();
    cards.remove(card);
    const usedBaseNames = cards.map(card => card.baseName.toLowerCase());
    addCardBaseName(card, usedBaseNames);
}
