import { registerAction } from '../../systems/actionSystem.js';
import {
    applyProjectInspection, resolveInspection, toggleIgnoredInspection
} from './inspectionActions.js';
import { mostSpecificInspection } from '../fieldComponents/inspectionRanges.js';
import { findingsAt } from '../fieldComponents/inspectionTargets.js';

const TARGET = '[data-inspection-target]';

function targetFor(event) {
    return event.target.closest?.(TARGET);
}

function openPopup(form, anchor, findings, hover = false) {
    const target = anchor.closest('cm-input')?.input ?? anchor;
    const specific = mostSpecificInspection(findings);
    const shown = specific ? [specific] : findings;
    form.inspectionPopup.open(anchor, shown, { target, hover });
}

const inspectionActions = {
    resolve: resolveInspection,
    ignore: toggleIgnoredInspection
};

function onKey(event, form) {
    if (!event.altKey || event.key !== 'Enter') return;
    const field = event.target.closest('cm-code');
    const target = targetFor(event) ?? field?.editor;
    const findings = field?.inspectionsAtCaret() ?? findingsAt(target);
    if (!findings.length) return;
    event.preventDefault();
    event.stopPropagation();
    openPopup(form, target, findings);
}

export default function bindInspectionInteractions(form) {
    const hover = event => {
        const target = targetFor(event);
        if (target) openPopup(form, target, findingsAt(target), true);
    };
    form.on('pointerover', hover);
    form.on('pointermove', hover);
    form.on('pointerout', event => {
        const target = targetFor(event);
        if (!target || target.contains(event.relatedTarget)) return;
        form.inspectionPopup.leaveAnchor(target, event);
    });
    form.on('click', event => {
        const target = targetFor(event);
        if (target?.matches('button, sl-icon-button'))
            openPopup(form, target, findingsAt(target));
    });
    form.addEventListener('keydown', event => onKey(event, form), { capture: true });
    form.on('inspection-toggle-ignore', event =>
        toggleIgnoredInspection(form, event.detail));
    form.on('inspection-resolve', event => resolveInspection(form, event.detail));
    registerAction('apply-project-inspection', (finding, action) =>
        applyProjectInspection(form, finding, inspectionActions[action]));
}
