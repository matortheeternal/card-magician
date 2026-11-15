let activeContext = null;

export function openContext() {
    const previous = activeContext;
    activeContext = { trackedUrls: [] };
    return previous;
}

export function releaseContext(context) {
    if (!context) return;
    for (const url of context.trackedUrls)
        URL.revokeObjectURL(url);
    context.trackedUrls = [];
}

export function restoreContext(context) {
    releaseContext(activeContext);
    activeContext = context;
}

export function createURL(blob) {
    if (!activeContext) throw new Error('No active context');
    const url = URL.createObjectURL(blob);
    activeContext.trackedUrls.push(url);
    return url;
}
