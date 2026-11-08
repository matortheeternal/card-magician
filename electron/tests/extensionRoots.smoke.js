import assert from 'node:assert/strict';
import path from 'node:path';
import { launch } from './TestApplication.js';

export async function runExtensionRootTests(profile) {
    const repository = path.resolve(import.meta.dirname, '../..');
    const packaged = Boolean(process.env.ELECTRON_SMOKE_BINARY);
    const cases = [
        { name: 'profile', args: [], expected: path.join(profile, 'extensions') },
        { name: 'development', args: ['--development'],
            expected: path.join(packaged ? profile : repository, 'extensions') },
        { name: 'override', args: ['--development', '--extensions-dir=.tmp/test extensions'],
            expected: path.resolve('.tmp/test extensions') }
    ];
    for (const { name, args, expected } of cases) {
        console.log(`Checking extension root: ${name}...`);
        const fixture = await launch({
            profile, id: 'cardmagician.test', url: '/icons/appIcon.png',
            extensionsPath: null, args
        });
        try {
            const environment = await fixture.driver.evaluate('appEnvironment');
            assert.equal(environment.paths.extensions, expected);
            assert.equal('plugins' in environment.paths, false);
            assert.equal('userExtensions' in environment.paths, false);
            assert.equal(environment.isDevelopment, !packaged && args.includes('--development'));
            await fixture.driver.evaluate('cardMagicianNative.call("terminateApp", [0])');
            await fixture.stopped();
        } finally {
            await fixture.cleanup();
        }
    }
}
