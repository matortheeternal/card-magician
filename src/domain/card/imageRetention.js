import { createURL } from '../../ui/systems/objectUrlSystem.js';

async function retainUrl(url, blob) {
    if (!url || url.startsWith('blob:') || url.startsWith('data:')) return url;
    if (blob) return createURL(blob);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Cannot retain image: ${url}`);
    return createURL(await response.blob());
}

/**
 * Copy editable image state and retain its content before a destructive change.
 * Existing immutable sources are shared; disk sources are retained lazily.
 * An optional backup Blob avoids reading content that was already captured.
 * The returned value owns independent crop settings; its URL lives with the project.
 */
export async function retainImage(value, blob) {
    const retained = value.clone();
    retained.imageUrl = await retainUrl(value.imageUrl, blob);
    return retained;
}
