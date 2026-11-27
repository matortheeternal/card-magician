import { launch, withTestProfile } from '../electron/tests/TestApplication.js';

const RESULT_TIMEOUT_MS = 30 * 60 * 1000;

function forwardedArgs() {
    return process.argv.slice(2).filter(arg => {
        return arg.startsWith('--template=') || arg === '--record';
    });
}

await withTestProfile('templates', async profile => {
    const fixture = await launch({
        profile,
        url: '/tests/templates.html',
        id: 'cardmagician.test',
        args: ['--disable-gpu', ...forwardedArgs()],
        timeout: RESULT_TIMEOUT_MS
    });
    try {
        await fixture.result();
    } finally {
        await fixture.cleanup();
    }
});
