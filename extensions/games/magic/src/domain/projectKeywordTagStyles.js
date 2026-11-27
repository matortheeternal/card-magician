import { keywordTagFamilies, tierStyle } from './oracleTagStyles.js';

function addKeywordStyles(styles, { name, tiers, disabled }) {
    if (disabled || !name) return;
    const style = tierStyle(tiers);
    for (const family of keywordTagFamilies) styles.set(family.tagFor(name), style);
}

export function projectKeywordTagStyles(keywords = []) {
    const styles = new Map();
    for (const keyword of keywords) addKeywordStyles(styles, keyword);
    return styles;
}
