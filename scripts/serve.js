import http from 'http';
import chokidar from 'chokidar';
import { finishBuild, getState, startBuild, markDirty } from './dev/state.js';
import { build } from './build.js';

function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function handleRebuild(res) {
    if (getState().building) {
        res.writeHead(409);
        res.end();
        return;
    }

    startBuild();
    try {
        await build();
        finishBuild(true);
        res.writeHead(200);
        res.end();
    } catch (err) {
        finishBuild(false, err);
        res.writeHead(500);
        res.end(err.message);
    }
}

const server = http.createServer(async (req, res) => {
    setCors(res);
    if (req.url === '/__dev/state') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(getState()));
        return;
    }

    if (req.url === '/__dev/rebuild' && req.method === 'POST') {
        await handleRebuild(res);
        return;
    }

    res.writeHead(404);
    res.end();
});

chokidar
    .watch(['src', 'modules', 'games/magic/src'], {
        ignoreInitial: true
    })
    .on('add', markDirty)
    .on('change', markDirty)
    .on('unlink', markDirty);

console.info('Starting dev server at localhost:3344');
server.listen(3344);
