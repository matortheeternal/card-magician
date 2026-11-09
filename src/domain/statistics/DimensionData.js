const L = localize('statistics');

function normalizeCategory(category) {
    if (typeof category === 'object') return { ...category };
    return { id: category, label: String(category) };
}

function recordValues(dimension, record) {
    const values = dimension.values(record);
    if (!Array.isArray(values))
        throw new Error(L`Dimension ${dimension.id} must return an array`);
    const ids = values.filter(id => id !== null && id !== undefined);
    if (!ids.length && dimension.missing !== undefined) ids.push(dimension.missing);
    return [...new Set(ids)];
}

function getCategories(dimension, records, values) {
    if (typeof dimension.categories === 'function') return dimension.categories(records);
    if (dimension.categories) return dimension.categories;
    const categories = [...new Set(values.flat())];
    if (dimension.compare) categories.sort(dimension.compare);
    return categories;
}

function indexCategories(categories, dimension) {
    const indices = new Map();
    for (const [index, category] of categories.entries()) {
        if (indices.has(category.id))
            throw new Error(L`Duplicate category in ${dimension.id}: ${category.id}`);
        indices.set(category.id, index);
    }
    return indices;
}

export default class DimensionData {
    constructor(dimension, records) {
        this.definition = dimension;
        const values = records.map(record => recordValues(dimension, record));
        const categories = getCategories(dimension, records, values);
        this.categories = categories.map(normalizeCategory);
        this.indices = indexCategories(this.categories, dimension);
        this.memberships = values.map(ids => this.membershipIndices(ids));
    }

    get label() { return this.definition.label; }

    membershipIndices(ids) {
        const indices = [];
        for (const id of ids) {
            if (!this.indices.has(id)) continue;
            indices.push(this.indices.get(id));
        }
        return indices;
    }

    indexOf(id) {
        if (!this.indices.has(id))
            throw new Error(L`Unknown statistics category: ${id}`);
        return this.indices.get(id);
    }
}
