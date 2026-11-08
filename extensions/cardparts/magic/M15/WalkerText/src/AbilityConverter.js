const NEGATIVE_COST_PATTERN = /^[−-]/;
const ABILITY_TEXT_PATTERN = /^([\s\S]+?)(?=[+−-]?(\d+|X):)/;
const REMAINING_TEXT_PATTERN = /^([\s\S]+?)$/;
const abilityCardExpr = /^([\s\S]*)$/;
const abilityExpr = /^([+−-]?(?:\d+|X)): (.+)/;

function getAbilityType(cost) {
    if (/^\+/.test(cost))
        return 'plus';
    if (NEGATIVE_COST_PATTERN.test(cost))
        return 'minus';
    return 'zero';
}

function parseAbility(match) {
    return {
        cost: match[1],
        type: getAbilityType(match[1]),
        content: match[2]
    };
}

function abiltiyBackgroundParts(index) {
    if (index % 2 !== 0) return '';
    return (
        `<div class="border-top"></div>
        <div class="middle-bg"></div>
        <div class="border-bottom"></div>`
    );
}

const abilityConverters = [{
    match: str => str.match(abilityExpr),
    convert: (match, convertParagraphs, index) => {
        const { type, cost, content } = parseAbility(match);
        return (
            `<div class="walker-ability">
                <div class="walker-ability-cost">
                    <div class="walker-ability-${type} cost">${cost}</div>
                    <div class="colon">:</div>
                </div>
                <div class="walker-ability-content">
                    ${abiltiyBackgroundParts(index)}
                    ${convertParagraphs(content)}
                </div>
            </div>`
        );
    }
}, {
    match: str => str.match(ABILITY_TEXT_PATTERN),
    convert: (match, convertParagraphs, index) => (
        `<div class="walker-static-ability">
            ${abiltiyBackgroundParts(index)}
            ${convertParagraphs(match[1])}
        </div>`
    )
}, {
    match: str => str.match(REMAINING_TEXT_PATTERN),
    convert: (match, convertParagraphs, index) => (
        `<div class="walker-static-ability">
            ${abiltiyBackgroundParts(index)}
            ${convertParagraphs(match[1])}
        </div>`
    )
}];

function getAbilityConverter(str) {
    for (const converter of abilityConverters) {
        const match = converter.match(str);
        if (match) return [converter, match];
    }
}

export const AbilityConverter = {
    match(str) {
        return str.match(abilityCardExpr);
    },
    convert(match, { convertParagraphs }) {
        const html = [];
        let remainingStr = match[0];
        let index = 0;
        while (remainingStr.length) {
            const [converter, match] = getAbilityConverter(remainingStr);
            if (!converter) throw new Error('Unknown ability');
            html.push(converter.convert(match, convertParagraphs, index));
            index++;
            remainingStr = remainingStr.slice(match[0].length).trimStart();
        }
        return html.join('');
    }
};
