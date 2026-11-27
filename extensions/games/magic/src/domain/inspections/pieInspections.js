import { getInspectionCatalog } from 'oracle-of-pie/inspection-catalog';

const L = localize('game-magic');

export default function pieInspections() {
    const { conditions, inspections } = getInspectionCatalog();
    const byId = new Map(conditions.map(condition => [condition.id, condition]));
    return inspections.map(inspection => ({
        ...inspection,
        category: L`Color pie`,
        conditions: inspection.conditions.map(id => byId.get(id))
    }));
}
