const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs/promises');
const { listPackage } = require('@electron/asar');

module.exports = async function verifyPackage(context) {
    const product = context.packager.appInfo.productFilename;
    const resources = context.electronPlatformName === 'darwin'
        ? path.join(context.appOutDir, `${product}.app/Contents/Resources`)
        : path.join(context.appOutDir, 'resources');
    const pluginRoot = context.electronPlatformName === 'darwin'
        ? path.join(context.appOutDir, `${product}.app/Contents/MacOS`)
        : context.appOutDir;
    const entries = listPackage(path.join(resources, 'app.asar'));
    const { pluginFolders } = await import('../../electron/pluginFolders.js');
    for (const folder of pluginFolders) {
        assert.ok(!entries.some(name => name === `/${folder}`
            || name.startsWith(`/${folder}/`)), `${folder} must be outside app.asar`);
        assert.ok((await fs.stat(path.join(pluginRoot, folder))).isDirectory(),
                  `Loose plugin folder missing: ${folder}`);
    }
    const unwanted = entries.filter(name => {
        return /\/(?:node_modules|tests|unused)(?:\/|$)/.test(name)
            || /\.(?:map|test\.js|tests\.js|smoke\.js)$/.test(name);
    });
    assert.deepEqual(unwanted, [], 'Unexpected development files in the archive');
    const resourcesToCheck = [
        '/electron/main.js', '/resources/js/main.js'
    ];
    for (const required of resourcesToCheck)
        assert.ok(entries.includes(required), `Required resource missing: ${required}`);
    for (const required of ['games/magic/main.js',
                            'modules/magic/M15/Text/src/textToHTML.js'])
        await fs.access(path.join(pluginRoot, required));
};
