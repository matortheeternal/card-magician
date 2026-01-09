const L = localize('game-magic');

const aWords = [
    L`no`,
    L`a`
];

const localeNumberWords = [
    L`zero`,
    L`one`,
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

export const numberWord = localeNumberWords.map(n => n);
export const numberWordOrA = localeNumberWords.map((n, i) => aWords[i] || n);

export function numberWordToDigit(numberWord) {
    return localeNumberWords.findIndex((word, number) =>
        word === numberWord || aWords[number] === numberWord
    );
}