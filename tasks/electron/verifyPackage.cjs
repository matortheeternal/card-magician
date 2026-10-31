const assert = require('node:assert/strict');
const path = require('node:path');
const { listPackage } = require('@electron/asar');

module.exports = async function verifyPackage(context) {
    const product = context.packager.appInfo.productFilename;
    const resources = context.electronPlatformName === 'darwin'
        ? path.join(context.appOutDir, `${product}.app/Contents/Resources`)
        : path.join(context.appOutDir, 'resources');
    const entries = listPackage(path.join(resources, 'app.asar'));
    const unwanted = entries.filter(name => {
        return /\/(?:node_modules|tests|unused)(?:\/|$)/.test(name)
            || /\.(?:map|test\.js|tests\.js|smoke\.js)$/.test(name);
    });
    assert.deepEqual(unwanted, [], 'Unexpected development files in the archive');
    const resourcesToCheck = [
        '/electron/main.js', '/resources/js/main.js', '/games/magic/main.js',
        '/modules/magic/M15/Text/src/textToHTML.js'
    ];
    for (const required of resourcesToCheck)
        assert.ok(entries.includes(required), `Required resource missing: ${required}`);
};
