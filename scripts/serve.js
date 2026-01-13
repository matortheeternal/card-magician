import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import { build } from './build.js';

let building = false;
let dirty = false;

async function handleRebuild() {
    if (building) return;
    building = true;

    try {
        console.log('start build');
        let start = Date.now();
        await build({ minify: false });
        console.log(`build completed (${Date.now() - start}ms)`);
        dirty = false;
        building = false;
        return { reload: true };
    } catch(error) {
        console.log(`build failed (${Date.now() - start}ms)`);
        building = false;
        return { error: error.stack || String(error) };
    }
}

function onFilesChange(path) {
    if (dirty) return;
    console.info(`change detected, build marked dirty > ${path}`);
    dirty = true;
    for (const client of server.clients) {
        if (client.readyState === WebSocket.OPEN)
            client.send(JSON.stringify({ dirty: true }));
    }
}

console.info('Starting dev server at localhost:3344');
const server = new WebSocketServer({ port: 3344 });
server.on('connection', ws => {
    ws.on('message', async data => {
        if (data.toString('utf8') !== 'rebuild') return;
        console.log('received rebuild request');
        const buildStatus = await handleRebuild();
        ws.send(JSON.stringify(buildStatus));
    });
});

chokidar
    .watch(['src', 'modules', 'games/magic/src'], {
        ignoreInitial: true
    })
    .on('add', onFilesChange)
    .on('change', onFilesChange)
    .on('unlink', onFilesChange);

