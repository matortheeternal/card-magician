import { inspectionKey } from './inspectionSuppressions.js';

function inspectionField(form, face, field) {
    return [...form.inspectionFields].find(item =>
        item.model === face && item.fieldId === field)?.fieldElement;
}

function isCurrent(form, finding) {
    return finding.card === form.editorCard
        && inspectionKey(finding) === finding.anchorKey;
}

export function applyProjectInspection(form, { side, card, field, key, ignored }, apply) {
    if (!form.isEditing(card) || !form.editorCard[side]) return;
    form.showFace(side);
    const element = inspectionField(form, form.editorCard[side], field);
    element?.scrollIntoView({ block: 'nearest' });
    const current = form.refreshInspections();
    const finding = current?.find(item => item.key === key && item.ignored === ignored);
    if (!finding) return;
    apply(form, finding);
}

export function toggleIgnoredInspection(form, finding) {
    form.inspectionPopup.close(true);
    if (!isCurrent(form, finding)) return;
    const ignored = new Set(form.editorCard.ignoredInspections ?? []);
    if (finding.ignored) ignored.delete(finding.ignoredKey);
    if (!finding.ignored) ignored.add(finding.key);
    form.editorCard.ignoredInspections = [...ignored];
    form.save().catch(() => {});
    form.refreshInspections();
}

export function resolveInspection(form, finding) {
    form.inspectionPopup.close();
    if (!isCurrent(form, finding)) return;
    const { resolution, location, face } = finding;
    const field = inspectionField(form, face, location.field);
    if (!field) return;
    if (resolution.type === 'focus') return field.input?.focus();
    const text = field.value;
    const { start, end } = location;
    if (field.editor?.textContent !== text) return;
    if (text.slice(start, end) !== resolution.expected) return;
    const next = text.slice(0, start) + resolution.replacement + text.slice(end);
    field.applyChange(next);
    field.editor.focus();
}
