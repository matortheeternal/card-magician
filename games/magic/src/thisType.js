const thisTypeStrategies = [{
        match: card => card.superType.match(/\binstant\b/i) || card.superType.match(/\sorcery\b/i),
        type: 'spell'
    }, {
        match: card => card.subType.match(/\bvehicle\b/i),
        type: 'vehicle'
    }, {
        match: card => card.subType.match(/\bspacecraft\b/i),
        type: 'spacecraft'
    }, {
        match: card => card.subType.match(/\bplanet\b/i),
        type: 'planet'
    }, {
        match: card => card.subType.match(/\bcreature\b/i),
        type: 'creature'
    }, {
        match: card => card.subType.match(/\bplaneswalker\b/i),
        type: 'planeswalker'
    }, {
        match: card => card.subType.match(/\bbattle\b/i),
        type: 'battle'
    }, {
        match: card => card.subType.match(/\bland\b/i),
        type: 'land'
    }, {
        match: card => card.subType.match(/\bartifact\b/i),
        type: 'artifact'
    }, {
        match: card => card.subType.match(/\benchantment\b/i),
        type: 'enchantment'
    }, {
        match: card => true,
        type: 'permanent'
}];

export function getThisType(card) {
    for (const strategy of thisTypeStrategies) {
        const match = strategy.match(card);
        if (match) return strategy.type;
    }
}