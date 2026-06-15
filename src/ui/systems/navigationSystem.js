const states = {};
let keepGoing = false;
let currentState = null;
let navigationLocked = false;

function withLock(fn) {
    return (...args) => {
        if (navigationLocked) return;
        navigationLocked = true;
        fn(...args);
        setTimeout(() => { navigationLocked = false; }, 150);
    };
}

export function registerState(name, { onEnter, onExit }) {
    if (Object.hasOwn(states, name))
        throw new Error(`State "${name}" is already registered`);
    states[name] = { onEnter, onExit };
}

export const pushState = withLock(name => {
    currentState = name;
    const entry = states[name];
    if (!entry) throw new Error(`Unknown navigation state: ${name}`);
    history.pushState(name, '');
    entry.onEnter?.();
});

export const popState = withLock(() => {
    keepGoing = false;
    history.back();
});

export const popAllStates = withLock(() => {
    keepGoing = true;
    history.back();
});

function resolveState(name) {
    return typeof name === 'string'
        ? states[name]
        : null;
}

window.addEventListener('popstate', (e) => {
    const entry = resolveState(currentState);
    currentState = e.state;
    if (!entry) return;
    entry.onExit?.();
    if (keepGoing) history.back();
});
