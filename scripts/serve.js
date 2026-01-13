import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import { finishBuild, getState, startBuild, markDirty } from './dev/state.js';
import { build } from './build.js';

async function handleRebuild() {
    if (getState().building) return;

    try {
        startBuild();
        await build({ minify: false });
        finishBuild(true);
        return { reload: true };
    } catch(error) {
        finishBuild(false, error.stack || String(error));
        return { lastError: error.stack || String(error) };
    }
}

function onFilesChange(path) {
    if (!markDirty(path)) return;
    const state = JSON.stringify(getState());
    for (const client of server.clients) {
        if (client.readyState === WebSocket.OPEN)
            client.send(state);
    }
}

console.info('Starting dev server at localhost:3344');
const server = new WebSocketServer({ port: 3344 });
server.on('connection', ws => {
    console.log('websocket client connected');
    ws.send(JSON.stringify(getState()));
    ws.on('close', () => {
        console.log('websocket client disconnected');
    });
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

