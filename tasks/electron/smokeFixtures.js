import fs from 'node:fs/promises';
import path from 'node:path';

export async function prepareUserExtensions(profilePath) {
    const extensionsPath = path.join(profilePath, 'extensions');
    const installedPath = process.env.ELECTRON_SMOKE_BINARY
        ? path.dirname(await fs.realpath(process.env.ELECTRON_SMOKE_BINARY))
        : path.resolve(import.meta.dirname, '../..');
    for (const relativePath of [
        'games/magic', 'cardparts/magic/M15/ColorIndicator',
        'templates/magic/M15/Main', 'exporters/WebExporter'
    ]) {
        await fs.cp(path.join(installedPath, 'extensions', relativePath),
                    path.join(extensionsPath, relativePath), { recursive: true });
    }
    const templatePath = path.join(extensionsPath,
                                   'templates/magic/M15/Main/template.json');
    const template = JSON.parse(await fs.readFile(templatePath, 'utf8'));
    template.label = 'User extension smoke template';
    await fs.writeFile(templatePath, JSON.stringify(template));
    const exporterPath = path.join(extensionsPath, 'exporters/WebExporter/exporter.json');
    const exporter = JSON.parse(await fs.readFile(exporterPath, 'utf8'));
    exporter.folder = 'user-web';
    await fs.writeFile(exporterPath, JSON.stringify(exporter));
    const localesPath = path.join(extensionsPath, 'locales');
    await fs.mkdir(localesPath, { recursive: true });
    await fs.writeFile(path.join(localesPath, 'smoke.yml'), '{}');
    await fs.writeFile(path.join(localesPath, 'locales.json'), JSON.stringify({
        smoke: { label: 'User extension smoke locale' }
    }));
    await fs.writeFile(path.join(extensionsPath, 'user-only.js'),
                       'export default "user extension";');
}

export async function preparePlatformFixtures(profilePath) {
    const dataPath = path.join(profilePath, 'data');
    const publicPath = path.join(dataPath, 'public');
    const privatePath = path.join(dataPath, 'private.txt');
    await fs.mkdir(publicPath, { recursive: true });
    await fs.writeFile(privatePath, 'Private file outside the mount');
    if (process.platform !== 'win32')
        await fs.symlink(privatePath, path.join(publicPath, 'escape.txt'));
}
