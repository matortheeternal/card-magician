import { getInspectionCatalog } from 'oracle-of-pie/inspection-catalog';

export default function pieInspections() {
    const { conditions, inspections } = getInspectionCatalog();
    const byId = new Map(conditions.map(condition => [condition.id, condition]));
    return inspections.map(inspection => ({
        ...inspection,
        conditions: inspection.conditions.map(id => byId.get(id))
    }));
}
