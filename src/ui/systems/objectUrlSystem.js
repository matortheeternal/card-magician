let activeContext = null;

export function clear(context) {
    const { trackedUrls } = context;
    const urlsToRevoke = trackedUrls.slice();
    trackedUrls.splice(0, trackedUrls.length);
    for (const url of urlsToRevoke)
        URL.revokeObjectURL(url);
}

export async function withNewContext(callback) {
    const prevContext = activeContext;
    activeContext = { trackedUrls: [] };
    try {
        await callback();
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
