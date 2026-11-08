import platform from '../platformAdapter.js';

export async function findTestFiles(dir) {
    const testFiles = [];
    if (!await platform.checkFolderExists(dir)) return [];
    const files = await platform.readDirectory(dir);
    for (const file of files) {
        const path = `${dir}/${file.entry}`;
        if (file.entry === '.' || file.entry === '..') continue;
        if (file.type === 'DIRECTORY') {
            testFiles.push(...await findTestFiles(path));
            continue;
        }
        if (file.entry.endsWith('.tests.js'))
            testFiles.push(path);
    }
    return testFiles;
}
