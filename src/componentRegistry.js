const components = new Map();

export function registerComponent(id, html, controller) {
    if (components.has(id))
        throw new Error(`Component ${id} already registered`);
    components.set(id, {
        id,
        html,
        controller
    });
}

export function getComponent(id) {
    return components.get(id);
}
