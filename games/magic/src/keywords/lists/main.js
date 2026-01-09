import baseKeywords from './keywords.json';
import abilityWords from './abilityWords.json';

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
        const escapedMatch = match[0]
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
            
        return '<i>' + escapedMatch + '</i>';
    }
};