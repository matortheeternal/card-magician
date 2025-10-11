const views = new Map();

export function registerView(id, options, controller) {
    if (views.has(id))
        throw new Error(`View ${id} already registered`);
    views.set(id, {
        id,
        ...options,
        controller
    });
}

export function getView(id) {
    return views.get(id);
}
