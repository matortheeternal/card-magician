function resolveColorOption(card, options, groupId) {
    const colorKey = card.getCardColorKey();
    const group = options.find(opt => opt.id === groupId);
    return group && group.items
        && group.items.find(item => item.c === colorKey);
}

function resolveOption(card, options, id) {
    for (const option of options) {
        if (option.id === id) return option;
        if (!option.items) continue;
        for (const item of option.items)
            if (item.id === id) return item;
    }
}

function getOtherFaceSymbol(card) {
    const otherFace = card.id === 'front'
        ? card.parent().back
        : card.parent().front;
    return otherFace?.faceSymbol;
}

const flipRule = ([frontKey, backKey], resolveFn = resolveOption) => ({
    match: str => str.match(new RegExp(`^(${frontKey}|${backKey})`)),
    resolve: (card, options, [str]) => {
        const otherKey = str === frontKey ? backKey : frontKey;
        return resolveFn(card, options, otherKey);
    }
});

const autoRules = [
    flipRule(['modal_front', 'modal_back'], resolveColorOption),
    flipRule(['day', 'night']),
    flipRule(['closed_fan', 'open_fan']),
];

function findMatchingRule(str) {
    for (const rule of autoRules) {
        const matchData = rule.match(str);
        if (matchData) return [rule, matchData];
    }
    return [null, null];
}

export default function computeAutoSymbol(card, options) {
    if (card.id !== 'front' && card.id !== 'back') return 'eldrazi';
    const defaultSymbolId = `${card.id}_triangle`;
    const otherSymbol = getOtherFaceSymbol(card);
    const [rule, matchData] = findMatchingRule(otherSymbol);
    if (rule) return rule.resolve(card, options, matchData);
    return resolveOption(card, options, defaultSymbolId);
}
