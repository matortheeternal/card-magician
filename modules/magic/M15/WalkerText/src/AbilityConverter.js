const abilityExpr = /^([+-]?\d+): (.+)/;

function getAbilityType(cost) {
    const cost2 = parseInt(cost);
    if (cost2 < 0)
        return 'minus';
    if (cost2 > 0)
        return 'plus';
    return 'zero';
}

export const AbilityConverter = {
    match(str) {
        // always and only used on walkers
        return str.match(abilityExpr);
    },
    convert(match, { convertParagraphs }) {
        const cost = match[1];
        const content = match[2];
        const type = getAbilityType(cost);
        return (
            `<div class="walker-ability">
                <div class="walker-ability-cost">
                    <div class="walker-ability-${type}">${cost}</div>
                    <div>:</div>
                </div>
                <div class="walker-ability-content">
                    ${convertParagraphs(content)}
                </div>
            </div>`
        );
    }
};
