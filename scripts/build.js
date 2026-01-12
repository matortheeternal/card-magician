import { buildApp } from './dev/buildApp.js';
import { finishBuild, getState, startBuild } from './dev/state.js';
import { fileURLToPath } from 'url';
import { buildMagic } from '@card-magician/magic/esbuild.config.js';

export async function build(options = { minify: false }) {
    const state = getState();
    if (state.building) return;

    try {
        startBuild();
        await buildApp(options);
        await buildMagic(options);
        finishBuild(true);
    } catch(error) {
        finishBuild(false, error.stack || String(error));
    }
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
    (async function() {
        await buildApp({});
        await buildMagic({});
    })().catch(err => {
        console.error(err);
        process.exit(1);
    });
}
