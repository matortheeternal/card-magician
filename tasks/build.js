import { fileURLToPath } from 'url';
import { buildApp } from './dev/buildApp.js';
import { buildTests } from './dev/buildTests.js';
import { buildMagic } from '@card-magician/magic/esbuild.config.js';

export async function build(options = { minify: false }) {
    await buildApp(options);
    await buildTests(options);
    await buildMagic(options);
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
    build({ minify: false }).catch(err => {
        console.error(err);
        process.exit(1);
    });
}
