import { hydrateFields, renderFields } from "./fieldSystem.js";

export default class ComponentWithFields extends HTMLElement {
    get fields() {
        return [];
    }

    renderFields(model) {
        renderFields(this, model, this.fields, this.getSelector);
    }

    hydrateFields() {
        hydrateFields(this);
    }

    getField(subcardId, fieldId) {
        const field = this.fields.find(field => field.id === fieldId);
        if (!field)
            throw new Error('Failed to resolve field: ' + fieldId);
        return field;
    }

    getModel(subcardId) {
        return {};
    }

    getSelector(field, model) {
        return `form-field[field-id="${field.id}"]` + (model.isSubcard
            ? `[subcard-id="${model.id}"]`
            : ':not([subcard-id])');
    }
}