import platform from '../platformAdapter.js';

export async function findTestFiles(dir) {
    const testFiles = [];
    const files = await platform.readDirectory(dir);
    for (const file of files) {
        const path = `${dir}/${file.entry}`;
        if (file.type === 'DIRECTORY') {
            if (file.entry === '.' || file.entry === '..') continue;
            testFiles.push(...await findTestFiles(path));
        } else if (file.entry.endsWith('.tests.js')) {
            testFiles.push(path);
        }
    }
    return testFiles;
}
