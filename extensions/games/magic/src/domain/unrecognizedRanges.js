const REMINDER_TEXT = /\([^()]*\)/g;

function locateAfter(locator, fragment, start, reminders) {
    if (!fragment) return null;
    const pattern = new RegExp(locator.pattern(fragment), 'g');
    pattern.lastIndex = start;
    let match;
    while ((match = pattern.exec(locator.source))) {
        const reminder = reminders.find(({ start, end }) =>
            match.index >= start && match.index < end);
        if (!reminder)
            return { start: match.index, end: match.index + match[0].length };
        pattern.lastIndex = reminder.end;
    }
    return null;
}

function collectAbilityRanges(ability, locator, start, reminders, ranges) {
    const bounds = locateAfter(locator, ability.raw, start, reminders);
    let cursor = bounds?.start ?? start;
    for (const [node] of ability.walk()) {
        if (!node.isUnrecognizedSpan) continue;
        const range = locateAfter(locator, node.raw, cursor, reminders);
        if (!range) continue;
        ranges.push(range);
        cursor = range.end;
    }
    return Math.max(cursor, bounds?.end ?? start);
}

export default function unrecognizedRanges(parsed) {
    const { locator } = parsed;
    const reminders = [...locator.source.matchAll(REMINDER_TEXT)]
        .map(({ index, 0: text }) => ({ start: index, end: index + text.length }));
    const ranges = [];
    let cursor = 0;
    for (const ability of parsed.text.abilities)
        cursor = collectAbilityRanges(ability, locator, cursor, reminders, ranges);
    return ranges;
}
