import numericKeywords from './numericKeywords.json';
import simpleKeywords from  './simpleKeywords.json';
import otherKeywords from  './otherKeywords.json';
import abilityWords from './abilityWords.json';

export const baseKeywords = [
    ...numericKeywords,
    ...simpleKeywords,
    ...otherKeywords
];

export function getKeywords(set) {
    const keywords = baseKeywords.map(kw => set.keywordOverrides?.[kw.label] || kw);

    return [...set.userKeywords, ...keywords];
}

export const AbilityWordConverter = {
    match(str) {
        const escapedAbilityWords = abilityWords.map(kw => RegExp.escape(kw));
        const abilityWordExpr = new RegExp(`^(${escapedAbilityWords.join('|')})`);
        return str.match(abilityWordExpr);
    },
    convert(match) {
        return '<i>' + match + '</i>';
    }
};