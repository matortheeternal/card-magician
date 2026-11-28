import parsedRules from './parsedRules.js';

function locateAbility(ability, locator, start) {
    const pattern = new RegExp(locator.pattern(ability.raw), 'g');
    pattern.lastIndex = start;
    const match = pattern.exec(locator.source);
    if (!match?.[0]) return null;
    return { start: match.index, end: match.index + match[0].length };
}

export default function* locatedAbilities(face, card) {
    const { locator, text } = parsedRules(face, card);
    let start = 0;
    for (const ability of text.abilities) {
        const range = locateAbility(ability, locator, start);
        start = range?.end ?? start;
        yield { ability, range };
    }
}
