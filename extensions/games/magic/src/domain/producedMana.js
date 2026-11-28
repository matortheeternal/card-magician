import { Query } from 'oracle-of-pie';

const addMana = Query.compile({
    kind: 'AddManaEffect',
    subjectIsOpponent: false,
    context: { granted: false, expansion: null }
});
const manaSymbol = /\{([WUBRGC])\}/gi;
const anyColor = /\b(?:any (?:one )?color|any combination of colors|chosen color)\b/i;
const anyType = /\b(?:any (?:one )?type|any combination of (?:mana )?types)\b/i;
const basicLandMana = new Map([
    ['Plains', 'W'], ['Island', 'U'], ['Swamp', 'B'], ['Mountain', 'R'], ['Forest', 'G']
]);

function effectMana(effect) {
    const { mana } = effect;
    if (anyType.test(mana)) return 'WUBRGC';
    const symbols = Array.from(mana.matchAll(manaSymbol), match => match[1].toUpperCase());
    if (anyColor.test(mana)) symbols.push(...'WUBRG');
    return symbols;
}

export default function* producedMana(parsed) {
    if (parsed.card.isLand) {
        for (const subtype of parsed.card.subtypes) {
            if (basicLandMana.has(subtype)) yield basicLandMana.get(subtype);
        }
    }
    for (const [node, context] of parsed.walked) {
        if (addMana.test(node, context)) yield* effectMana(node);
    }
}
