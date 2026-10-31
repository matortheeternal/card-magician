import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import RuntimeInstaller from './runtime/RuntimeInstaller.js';

const root = fileURLToPath(new URL('../', import.meta.url));

async function install() {
    if (process.env.NEUTRALINO_SKIP_INSTALL === '1') {
        console.log('Using a developer-managed Neutralino runtime (installation skipped).');
        return;
    }
    const lock = JSON.parse(await readFile(new URL('../neutralino.lock.json', import.meta.url)));
    const config = JSON.parse(await readFile(new URL('../neutralino.config.json', import.meta.url)));
    if (`v${config.cli.binaryVersion}` !== lock.tag
            || config.cli.clientVersion !== lock.client.version)
        throw new Error('neutralino.config.json versions do not match neutralino.lock.json.');
    const installer = new RuntimeInstaller(root, lock);
    if (!process.argv.includes('--verify')) return installer.install();
    const missing = await installer.verify();
    if (missing.length) throw new Error(`Pinned Neutralino files differ: ${missing.join(', ')}`);
    console.log(`Verified ${lock.repository}@${lock.tag} (${lock.revision})`);
}

install().catch(error => {
    console.error(`Neutralino setup failed: ${error.message}`);
    process.exitCode = 1;
});
