const findingsByTarget = new WeakMap();

export function markInspectionTarget(target, findings) {
    target.toggleAttribute('data-inspection-target', findings.length > 0);
    findingsByTarget.set(target, findings);
}

export function findingsAt(target) {
    return findingsByTarget.get(target) ?? [];
}
