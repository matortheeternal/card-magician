export function hasSequence(card) {
    return Number.isInteger(card.sequence);
}

function sequenceRank(card) {
    return hasSequence(card) ? card.sequence : Number.MAX_SAFE_INTEGER;
}

function compareText(a, b) {
    if (a === b) return 0;
    return a < b ? -1 : 1;
}

export function compareCardOrder(a, b) {
    const bySequence = sequenceRank(a) - sequenceRank(b);
    if (bySequence) return bySequence;
    return compareText(a.files.get('data') ?? '', b.files.get('data') ?? '');
}

export function highestSequence(cards) {
    return cards.filter(hasSequence)
        .reduce((highest, card) => Math.max(highest, card.sequence), 0);
}
