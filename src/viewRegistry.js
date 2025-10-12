const views = new Map();

export function registerView(id, html, controller) {
    if (views.has(id))
        throw new Error(`View ${id} already registered`);
    views.set(id, {
        id,
        html,
        controller
    });
}

export function getView(id) {
    return views.get(id);
}
