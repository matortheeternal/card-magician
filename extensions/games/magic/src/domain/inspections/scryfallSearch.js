const SEARCH_URL = 'https://scryfall.com/search';

function searchUrl(query) {
    return `${SEARCH_URL}?q=${encodeURIComponent(query)}`;
}

export function inspectionSearchUrl(inspection) {
    return searchUrl(inspection.scryfall);
}

export function colorSearchUrl(inspection, color) {
    return searchUrl(`${inspection.scryfall} c=${color.toLowerCase()}`);
}
