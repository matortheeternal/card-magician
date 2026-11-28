import { registerAction } from '../../systems/actionSystem.js';
import {
    applyProjectInspection, resolveInspection, toggleIgnoredInspection
} from './inspectionActions.js';
import { findingsAt } from '../fieldComponents/inspectionTargets.js';

const TARGET = '[data-inspection-target]';

function targetFor(event) {
    return event.target.closest?.(TARGET);
}

function openPopup(form, anchor, findings, hover = false) {
    const target = anchor.closest('cm-input')?.input ?? anchor;
    form.inspectionPopup.open(anchor, findings, { target, hover });
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
    form.on('pointerover', event => {
        const target = targetFor(event);
        if (!target) return;
        openPopup(form, target, findingsAt(target), true);
    });
    form.on('pointerout', event => {
        if (targetFor(event)) form.inspectionPopup.leave();
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
