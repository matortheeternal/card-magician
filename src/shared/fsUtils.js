import { getStats, readFile } from './neutralinoAdapter.js';

/**
 * Loads and parses a JSON file from the given file path.
 * @param {string} filePath
 * @returns {Promise<any>}
 */
export async function loadJson(filePath) {
    const text = await readFile(filePath);
    return JSON.parse(text);
}

/**
 * Returns true if a file exists at the given file path.
 * @param {string} filePath
 * @returns {Promise<(() => boolean)>}
 */
export async function checkFileExists(filePath) {
    try {
        const stats = await getStats(filePath);
        return stats.isFile;
    } catch (error) {
        if (error.code === 'NE_FS_NOPATHE') return false;
        throw error;
    }
}

/**
 * Loads a text file from the given mounted file path.
 *
 * @param {string} filePath
 * @returns {Promise<string>}
 */
export async function loadTextFile(filePath) {
    const response = await fetch(filePath);
    if (!response.ok)
        throw new Error(`Failed to load file ${filePath}, ${response.status}`);
    return await response.text();
}

/**
 * Returns a hexadecimal string corresponding to the fnv1a hash of an input string.
 *
 * @param {string} str
 * @returns {string}
 */
export function fnv1a(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = (hash * 0x01000193) >>> 0;
    }
    return (hash >>> 0).toString(16);
}
