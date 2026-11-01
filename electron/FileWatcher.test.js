import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { watchFile } from './FileWatcher.js';

const pause = ms => new Promise(resolve => { setTimeout(resolve, ms); });

async function eventually(check) {
    for (let attempt = 0; attempt < 150; attempt++) {
        if (check()) return;
        await pause(20);
    }
    assert.fail('Timed out waiting for a file event');
}

test('settles chunked writes and follows atomic replacement, deletion, and recreation',
     async () => {
         const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'cm-watch-'));
         const filename = path.join(directory, 'symbol.svg');
         const events = [];
         let close;
         try {
             await fs.writeFile(filename, 'initial');
             close = await watchFile(filename, event => events.push(event), 80);
             await fs.writeFile(filename, 'first');
             await pause(30);
             await fs.appendFile(filename, ' second');
             await pause(30);
             assert.equal(events.length, 0);
             await eventually(() => events.length === 1);
             assert.equal(await fs.readFile(filename, 'utf8'), 'first second');
             assert.equal(events[0].type, 'change');
             await fs.writeFile(path.join(directory, 'replacement'), 'replacement');
             await fs.rename(path.join(directory, 'replacement'), filename);
             await eventually(() => events.length === 2);
             assert.equal(events[1].type, 'change');
             await fs.unlink(filename);
             await eventually(() => events.length === 3);
             assert.equal(events[2].type, 'delete');
             await fs.writeFile(filename, 'recreated');
             await eventually(() => events.length === 4);
             assert.equal(events[3].type, 'change');
             await fs.writeFile(filename, 'cancelled');
             close();
             await pause(250);
             assert.equal(events.length, 4);
             assert.ok(events.every(event => event.path === filename));
         } finally {
             close?.();
             await fs.rm(directory, { recursive: true, force: true });
         }
     });

test('watches missing files independently and ignores other files', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'cm-watch-'));
    const first = path.join(directory, 'first.svg');
    const second = path.join(directory, 'second.svg');
    const firstEvents = [];
    const secondEvents = [];
    let closeFirst, closeSecond;
    try {
        closeFirst = await watchFile(first, event => firstEvents.push(event), 40);
        closeSecond = await watchFile(second, event => secondEvents.push(event), 40);
        await fs.writeFile(path.join(directory, 'unrelated'), 'ignored');
        await pause(150);
        assert.equal(firstEvents.length, 0);
        assert.equal(secondEvents.length, 0);
        await fs.writeFile(first, 'first');
        await eventually(() => firstEvents.length === 1);
        assert.equal(secondEvents.length, 0);
        closeFirst();
        await fs.writeFile(first, 'ignored after close');
        await fs.writeFile(second, 'second');
        await eventually(() => secondEvents.length === 1);
        assert.equal(firstEvents.length, 1);
        assert.equal(secondEvents[0].type, 'change');
    } finally {
        closeFirst?.();
        closeSecond?.();
        await fs.rm(directory, { recursive: true, force: true });
    }
});
