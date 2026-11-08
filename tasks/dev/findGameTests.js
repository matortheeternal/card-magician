import fs from 'node:fs/promises';
import path from 'node:path';

async function readDirectory(directory, options) {
    try {
        return await fs.readdir(directory, options);
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw error;
    }
}

async function testsInSource(source, suffix) {
    const files = await readDirectory(source, { recursive: true });
    const tests = [];
    for (const file of files) {
        if (!file.endsWith(suffix)) continue;
        tests.push(path.join(source, file).replaceAll('\\', '/'));
    }
    return tests;
}

export async function findGameTests(
    directory = 'extensions/games', suffix = '.tests.js'
) {
    const games = await readDirectory(directory, { withFileTypes: true });
    const tests = [];
    for (const game of games) {
        if (!game.isDirectory()) continue;
        const source = path.join(directory, game.name, 'src');
        tests.push(...await testsInSource(source, suffix));
    }
    return tests.sort();
}
