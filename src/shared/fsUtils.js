import platform from './platformAdapter.js';
import { determineImageType } from './imageUtils.js';

/**
 * Loads and parses a JSON file from the given file path.
 * @param {string} filePath
 * @returns {Promise<any>}
 */
export async function loadJson(filePath) {
    const text = await platform.readFile(filePath);
    return JSON.parse(text);
}

async function getMatchingEntries(folderPath, options) {
    options = Object.assign({
        matching: null,
        files: true,
        directories: false,
        recursive: false,
    }, options);
    if (!await platform.checkFolderExists(folderPath)) return [];
    const entries = await platform.readDirectory(folderPath, { recursive: options.recursive });
    return entries.filter(({ entry, type }) => {
        if (!options.files && type === 'FILE') return false;
        if (!options.directories && type === 'DIRECTORY') return false;
        return !options.matching || options.matching.test(entry);
    });
}

/**
 * Returns the contents of a folder if it exists, else returns an empty array.
 * @param {string} folderPath
 * @param {object} options
 * @returns {Promise<Array<string>>}
 */
export async function find(folderPath, options = {}) {
    const entries = await getMatchingEntries(folderPath, options);
    const paths = [];
    for (const { entry } of entries) {
        const path = await platform.getJoinedPath(folderPath, entry);
        paths.push(path);
    }
    return paths;
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
    return response.text();
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

/**
 * Loads an image file from a file path and returns a blob containing it.
 *
 * @param {string} filePath - path to the image file to load
 * @returns {Promise<Blob>} - the image file as a blob
 */
export async function loadImageFile(filePath) {
    const data = await platform.readBinaryFile(filePath);
    const type = determineImageType(data);
    return new Blob([data], { type });
}
