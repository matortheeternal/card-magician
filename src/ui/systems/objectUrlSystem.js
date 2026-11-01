import * as historySystem from './historySystem.js';

let activeContext = null;

export function clear(context) {
    if (!context?.trackedUrls) return;
    for (const url of context.trackedUrls)
        URL.revokeObjectURL(url);
    context.trackedUrls = [];
}

export async function withNewContext(callback) {
    const prevContext = activeContext;
    activeContext = { trackedUrls: [] };
    try {
        await historySystem.reset();
        await callback();
        clear(prevContext);
    } catch (error) {
        clear(activeContext);
        activeContext = prevContext;
        throw error;
    }
}

export function createURL(blob) {
    if (!activeContext) throw new Error('No active context');
    const url = URL.createObjectURL(blob);
    activeContext.trackedUrls.push(url);
    return url;
}
