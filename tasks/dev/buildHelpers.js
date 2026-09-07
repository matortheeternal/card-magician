import fs from 'node:fs/promises';

export async function getSourceFiles(testFileCallback) {
    const files = await fs.readdir('src', { recursive: true });
    return files.map(file => file.replaceAll('\\', '/'))
        .filter(testFileCallback)
        .map(file => `./${file}`);
}
