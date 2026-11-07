import { preparePlatformFixtures } from '../electron/tests/fixtures.js';
import { launch, withTestProfile } from '../electron/tests/TestApplication.js';

await withTestProfile('unit', async profile => {
    await preparePlatformFixtures(profile);
    const fixture = await launch({
        profile, url: '/tests/tests.html', id: 'cardmagician.test',
        args: process.platform === 'win32' ? [] : ['--test-symlinks']
    });
    try {
        await fixture.result();
    } finally {
        await fixture.cleanup();
    }
});
