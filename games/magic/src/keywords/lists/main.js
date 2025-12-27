import numericKeywords from './numericKeywords.json';
import simpleKeywords from  './simpleKeywords.json';

export const baseKeywords = [
    ...numericKeywords,
    ...simpleKeywords
];

export function getKeywords(set) {
    return [
        ...baseKeywords,
        // set.currentUserKeyword
    ];
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