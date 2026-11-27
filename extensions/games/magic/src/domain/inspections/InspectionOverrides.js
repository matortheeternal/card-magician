import { sameExceptions, storedException } from './exceptionLists.js';

function setOrDelete(record, key, value, isDefault) {
    if (isDefault) {
        delete record[key];
        return;
    }
    record[key] = value;
}

function pruneEmpty(entry, key) {
    if (!Object.keys(entry[key]).length) delete entry[key];
}

function enabledByDefault(inspection) {
    return inspection?.enabledByDefault ?? true;
}

function clearEntry(entry) {
    for (const key of Object.keys(entry)) delete entry[key];
}

export default class InspectionOverrides {
    constructor(project, inspections) {
        this.project = project;
        this.inspections = new Map(inspections.map(item => [item.id, item]));
    }

    get all() {
        return this.project.inspectionOverrides ?? {};
    }

    get disabledIds() {
        const ids = [...this.inspections.keys()].filter(id => !this.isEnabled(id));
        return new Set(ids);
    }

    isEnabled(id) {
        const disabled = this.all[id]?.disabled;
        if (disabled === undefined) return enabledByDefault(this.inspections.get(id));
        return !disabled;
    }

    has(id) {
        return Boolean(this.all[id]);
    }

    tiersOf(inspection) {
        return { ...inspection.tiers, ...this.all[inspection.id]?.tiers };
    }

    exceptionsOf(inspection) {
        return this.all[inspection.id]?.exceptions ?? inspection.exceptions;
    }

    setEnabled(ids, enabled) {
        this.update(ids, (entry, id) => {
            const isDefault = enabled === enabledByDefault(this.inspections.get(id));
            setOrDelete(entry, 'disabled', !enabled, isDefault);
        });
    }

    setTier(inspection, color, tier) {
        this.update([inspection.id], entry => {
            entry.tiers ??= {};
            setOrDelete(entry.tiers, color, tier, tier === inspection.tiers[color]);
            pruneEmpty(entry, 'tiers');
        });
    }

    setExceptions(inspection, exceptions) {
        const isDefault = sameExceptions(exceptions, inspection.exceptions);
        const stored = exceptions.map(storedException);
        this.update([inspection.id], entry =>
            setOrDelete(entry, 'exceptions', stored, isDefault));
    }

    reset(id) {
        this.update([id], clearEntry);
    }

    update(ids, change) {
        const overrides = this.all;
        for (const id of ids) {
            const entry = overrides[id] ?? {};
            change(entry, id);
            overrides[id] = entry;
            if (!Object.keys(entry).length) delete overrides[id];
        }
        this.project.inspectionOverrides = overrides;
        if (!Object.keys(overrides).length) delete this.project.inspectionOverrides;
    }
}
