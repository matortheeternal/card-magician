import numericKeywords from './numericKeywords.json';
import simpleKeywords from  './simpleKeywords.json';

export const baseKeywords = [
    ...numericKeywords,
    ...simpleKeywords
];

export function getKeywords(set) {
    console.log(set);
    const keywords = [];

    for (const keyword of baseKeywords) {
        const override = set.keywordOverrides?.[keyword.label];
        keywords.push(override ? override : keyword);
    }

    return keywords;
}

function makeAbilityWordConverter(keyword) {
    return {
        match(str) {
            return str.match('^' + keyword);
        },
        convert(match) {
            return '<i>' + match + '</i>';
        }
    };
}

import abilityWords from './abilityWords.json';

export const AbilityWordConverters = abilityWords.map(kw => makeAbilityWordConverter(kw));