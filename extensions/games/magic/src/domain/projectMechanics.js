import Oracle, { inferMechanics } from 'oracle-of-pie';
import { inferMechanicAffinities } from './mechanicAffinities.js';
import { getCardFaces, isOracleCard } from './oracleCardEligibility.js';

let stockOracle;

export const mechanicFields = {
    keywords: 'customKeywords',
    actions: 'customKeywordActions'
};

export function projectDefinitions(project) {
    return {
        keywords: project?.customKeywords ?? [],
        actions: project?.customKeywordActions ?? [],
        tokens: project?.customTokens ?? []
    };
}

function scanFace(face) {
    const subcards = face.subcards ?? Object.values(face)
        .filter(value => typeof value?.rulesText === 'string');
    return [face, ...subcards];
}

function scanCards(project, editorCard) {
    return project.cards.flatMap(card => {
        const source = editorCard?.baseCard === card ? editorCard : card;
        if (!isOracleCard(source)) return [];
        return [{ name: card.name, faces: getCardFaces(source).flatMap(scanFace) }];
    });
}

function discoverMechanics(cards) {
    stockOracle ??= new Oracle();
    const result = inferMechanics(cards, { oracle: stockOracle, includeEvidence: true });
    return [
        ...result.keywords.map(definition => ({ ...definition, kind: 'keywords' })),
        ...result.actions.map(definition => ({ ...definition, kind: 'actions' }))
    ];
}

export function mechanicReminders(definition) {
    const values = definition.reminders?.length
        ? definition.reminders
        : [definition.reminder ?? ''];
    return [...new Set(values.map(text => text.trim()).filter(Boolean))];
}

export function withMechanicReminders(definition, reminders) {
    const result = { ...definition, reminder: reminders[0] ?? '' };
    if (reminders.length > 1) result.reminders = reminders;
    if (reminders.length <= 1) delete result.reminders;
    return result;
}

export function entriesFor(project) {
    const definitions = projectDefinitions(project);
    return Object.keys(mechanicFields).flatMap(kind =>
        definitions[kind].map(definition => ({ kind, definition })));
}

export function mergeDiscoveries(entries, discoveries) {
    const merged = [...entries];
    const indexes = new Map(entries.map((entry, index) =>
        [entry.definition.name.toLowerCase(), index]));
    for (const discovery of discoveries) {
        const { kind, name } = discovery;
        const key = name.toLowerCase();
        const index = indexes.get(key) ?? merged.length;
        const current = merged[index];
        if (current && current.kind !== kind) continue;
        const original = current?.definition ?? { name };
        const saved = mechanicReminders(original);
        const reminders = [...new Set([...saved, ...mechanicReminders(discovery)])];
        if (current && saved.length === reminders.length) continue;
        merged[index] = { kind, definition: withMechanicReminders(original, reminders) };
        indexes.set(key, index);
    }
    return merged;
}

export function autodetectMechanics(project, editorCard, entries) {
    const cards = scanCards(project, editorCard);
    const merged = mergeDiscoveries(entries, discoverMechanics(cards));
    return inferMechanicAffinities(merged, cards);
}
