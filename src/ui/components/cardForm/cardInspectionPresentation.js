import { markInspectionTarget } from '../fieldComponents/inspectionTargets.js';
import { keyFindings } from './inspectionSuppressions.js';

const L = localize('card-form');

function showSummary(summary, findings) {
    const items = findings.map(finding => {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = finding.label;
        button.setAttribute('aria-haspopup', 'dialog');
        markInspectionTarget(button, [finding]);
        item.append(button);
        return item;
    });
    summary.hidden = !items.length;
    summary.replaceChildren(...items);
}

export function describeFindings(findings, inspections) {
    const titles = new Map(inspections.map(({ id, title }) => [id, title]));
    return keyFindings(findings).map(finding => {
        const title = titles.get(finding.inspectionId);
        const label = L`${title}: ${finding.message}`;
        const side = finding.face === finding.card.back ? 'back' : 'front';
        return { ...finding, side, title, label };
    });
}

function groupFindings(findings) {
    const byFace = new Map();
    for (const finding of findings) {
        const field = finding.location?.field;
        if (!field) continue;
        if (!byFace.has(finding.face)) byFace.set(finding.face, new Map());
        const byField = byFace.get(finding.face);
        if (!byField.has(field)) byField.set(field, []);
        byField.get(field).push(finding);
    }
    return byFace;
}

export default function presentInspections(findings, fields, summary) {
    const byFace = groupFindings(findings);
    const unplaced = new Set(findings);
    for (const { fieldElement, model, fieldId } of fields) {
        if (!fieldElement?.setInspectionFindings) continue;
        if (fieldElement.style.display === 'none') continue;
        const warnings = byFace.get(model)?.get(fieldId) ?? [];
        fieldElement.setInspectionFindings(warnings);
        for (const warning of warnings) unplaced.delete(warning);
    }
    showSummary(summary, [...unplaced]);
}
