const abilityCardExpr = /^([\s\S]*)$/;
const abilityExpr = /^([+−-]?(?:\d+|X)): (.+)/;

function getAbilityType(cost) {
    if (/^\+/.test(cost))
        return 'plus';
    if (/^[−-]/.test(cost))
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

const abilityConverters = [{
    match: str => str.match(abilityExpr),
    convert: (match, convertParagraphs) => {
        const { type, cost, content } = parseAbility(match);
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
}, {
    match: str => str.match(/^([\s\S]+?)(?=[+−-]?(\d+|X):)/),
    convert: (match, convertParagraphs) => (
        `<div class="walker-static-ability">
            ${convertParagraphs(match[1])}
        </div>`
    )
}, {
    match: str => str.match(/^([\s\S]+?)$/),
    convert: (match, convertParagraphs) => (
        `<div class="walker-static-ability">
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
        while (remainingStr.length) {
            const [converter, match] = getAbilityConverter(remainingStr);
            if (!converter) throw new Error('Unknown ability');
            html.push(converter.convert(match, convertParagraphs));
            remainingStr = remainingStr.slice(match[0].length).trimStart();
        }
        return html.join('');
    }
};
