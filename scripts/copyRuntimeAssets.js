import fs from 'fs';
import path from 'path';

const root = process.cwd();
const outDir = path.join(root, 'build', 'bin');

const folders = [
    'modules',
    'games',
    'templates',
    'locales'
];

for (const folder of folders) {
    const src = path.join(root, folder);
    const dest = path.join(outDir, folder);

    if (!fs.existsSync(src)) {
        console.warn(`Skipping missing folder: ${folder}`);
        continue;
    }

    fs.rmSync(dest, { recursive: true, force: true });
    fs.cpSync(src, dest, { recursive: true });

    console.log(`Copied ${folder} → build/bin/${folder}`);
}
