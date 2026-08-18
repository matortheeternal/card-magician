import fs from 'node:fs/promises';

export async function getSourceFiles(testFileCallback) {
    const files = await fs.readdir('src', { recursive: true });
    return files.filter(testFileCallback)
        .map(file => `./${file}`);
}
