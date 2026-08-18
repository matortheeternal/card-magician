import { WebSocket, WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import { build } from './build.js';

let building = false;
let dirty = false;

function debounce(func, delay) {
    let timeout = null;
    return function() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, delay);
    };
}

async function handleRebuild() {
    if (building) return;
    building = true;

    console.log('start build');
    let start = Date.now();
    try {
        await build({ minify: false });
        console.log(`build completed (${Date.now() - start}ms)`);
        dirty = false;
        return { reload: true };
    } catch(error) {
        console.log(`build failed (${Date.now() - start}ms)`);
        return { error: error.stack || String(error) };
    } finally {
        building = false;
    }
}

const onFilesChange = debounce(function onFilesChange(path) {
    console.info(`change detected, build marked dirty > ${path}`);
    dirty = true;
    for (const client of server.clients) {
        if (client.readyState === WebSocket.OPEN)
            client.send(JSON.stringify({ dirty: true }));
    }
}, 500);

console.info('Starting dev server at localhost:3344');
const server = new WebSocketServer({ port: 3344 });
let openedProject = null;
let selectedCard = null;
server.on('connection', ws => {
    ws.on('message', async data => {
        const event = JSON.parse(data.toString('utf8'));
        if (event.action === 'rebuild') {
            openedProject = event.project;
            selectedCard = event.editorCard;
            console.log('received rebuild request');
            const buildStatus = await handleRebuild();
            ws.send(JSON.stringify(buildStatus));
        } else if (event.action === 'request data') {
            ws.send(JSON.stringify({
                'openProject': openedProject,
                'selectCard': selectedCard,
            }));
        }
    });
});

chokidar
    .watch(['src', 'modules', 'games/magic/src'], {
        ignoreInitial: true
    })
    .on('add', onFilesChange)
    .on('change', onFilesChange)
    .on('unlink', onFilesChange);

