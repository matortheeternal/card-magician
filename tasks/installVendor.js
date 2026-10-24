import { copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

async function installJasmine() {
    const source = join(root, 'node_modules/jasmine-core/lib/jasmine-core');
    const destination = join(root, 'resources/tests/jasmine');
    const files = [
        'jasmine.js',
        'jasmine-html.js',
        'jasmine.css'
    ];

    await mkdir(destination, { recursive: true });
    for (const file of files)
        await copyFile(join(source, file), join(destination, file));
}

await installJasmine();
