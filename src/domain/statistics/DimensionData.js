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

function indexCategories(categories, dimension, excluded) {
    const indices = new Map();
    const seen = new Set();
    const available = [];
    for (const category of categories) {
        if (seen.has(category.id))
            throw new Error(L`Duplicate category in ${dimension.id}: ${category.id}`);
        seen.add(category.id);
        if (excluded.has(category.id)) continue;
        indices.set(category.id, available.length);
        available.push(category);
    }
    return { categories: available, indices };
}

export default class DimensionData {
    constructor(dimension, records, excludedCategories = []) {
        this.definition = dimension;
        const values = records.map(record => recordValues(dimension, record));
        const categories = getCategories(dimension, records, values);
        const indexed = indexCategories(categories.map(normalizeCategory), dimension,
                                        new Set(excludedCategories));
        this.categories = indexed.categories;
        this.indices = indexed.indices;
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
