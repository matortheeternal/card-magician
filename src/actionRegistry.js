const actions = new Map();

export function registerAction(id, action) {
    if (actions.has(id))
        throw new Error(`Action ${id} already registered.`);
    actions.set(id, action);
}

export function executeAction(id, args = []) {
    return actions.get(id)(...args);
}
