import element from './element.js';

const L = localize('game-magic');

export const COLORS = { W: L`White`, U: L`Blue`, B: L`Black`, R: L`Red`, G: L`Green` };

export function colorIcon(color) {
    const image = element('img');
    image.src = activeGame.symbols.resolveColorSymbolIcon(color.toLowerCase());
    image.alt = '';
    return image;
}
