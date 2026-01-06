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

function makeAbilityWordConverter(abilityWord) {
    return {
        match(str) {
            return str.match(new RegExp('^' + RegExp.escape(abilityWord)));
        },
        convert(match) {
            return '<i>' + match + '</i>';
        }
    };
}

export const AbilityWordConverters = abilityWords.map(kw => makeAbilityWordConverter(kw));