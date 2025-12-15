const L = localize('game-magic');

const localeNumberWords = [
    [L`zero`, L`no`],
    [L`one`, L`a`],
    L`two`,
    L`three`,
    L`four`,
    L`five`,
    L`six`,
    L`seven`,
    L`eight`,
    L`nine`,
    L`ten`,
    L`eleven`,
    L`twelve`,
    L`thirteen`,
    L`fourteen`,
    L`fifteen`,
    L`sixteen`,
    L`seventeen`,
    L`eighteen`,
    L`nineteen`,
    L`twenty`
];

export const numberWord = localeNumberWords.map(n => Array.isArray(n) ? n[0] : n);
export const numberWordOrA = localeNumberWords.map(n => Array.isArray(n) ? n[1] : n);

export function numberWordToDigit(numberWord) {
    return localeNumberWords.findIndex((word, number) => Array.isArray(word) ? word.includes(numberWord) : word === numberWord);
}