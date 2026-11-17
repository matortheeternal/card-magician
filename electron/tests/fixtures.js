import fs from 'node:fs/promises';
import zlib from 'node:zlib';
import path from 'node:path';

export async function preparePlatformFixtures(profilePath) {
    const dataPath = path.join(profilePath, 'data');
    const publicPath = path.join(dataPath, 'public');
    const privatePath = path.join(dataPath, 'private.txt');
    await fs.mkdir(publicPath, { recursive: true });
    await fs.writeFile(privatePath, 'Private file outside the mount');
    if (process.platform !== 'win32')
        await fs.symlink(privatePath, path.join(publicPath, 'escape.txt'));
}

const ZIP_LOCAL_FILE = 0x04034b50;
const ZIP_CENTRAL_FILE = 0x02014b50;
const ZIP_END = 0x06054b50;
const ZIP_UTF8_NAMES = 0x0800;

function zipHeader(signature, fields) {
    const header = Buffer.alloc(4 + fields.reduce((size, [bytes]) => size + bytes, 0));
    header.writeUInt32LE(signature, 0);
    let offset = 4;
    for (const [bytes, value] of fields) {
        header[bytes === 2 ? 'writeUInt16LE' : 'writeUInt32LE'](value, offset);
        offset += bytes;
    }
    return header;
}

function zipEntry(name, data, offset) {
    const nameBytes = Buffer.from(name);
    const crc = zlib.crc32(data);
    const shared = [
        [2, ZIP_UTF8_NAMES], [2, 0], [2, 0], [2, 0],
        [4, crc], [4, data.length], [4, data.length], [2, nameBytes.length], [2, 0]
    ];
    const local = Buffer.concat([zipHeader(ZIP_LOCAL_FILE, [[2, 20], ...shared]),
                                 nameBytes, data]);
    const central = Buffer.concat([zipHeader(ZIP_CENTRAL_FILE, [
        [2, 20], [2, 20], ...shared, [2, 0], [2, 0], [2, 0], [4, 0], [4, offset]
    ]), nameBytes]);
    return { local, central };
}

async function listFiles(directory, include) {
    const entries = await fs.readdir(directory, { recursive: true, withFileTypes: true });
    return entries
        .filter(entry => entry.isFile())
        .map(entry => path.relative(directory, path.join(entry.parentPath, entry.name)))
        .map(relative => relative.replaceAll(path.sep, '/'))
        .filter(include)
        .sort();
}

export async function createPackage(source, prefix, outputPath, include = () => true) {
    const locals = [];
    const centrals = [];
    let offset = 0;
    for (const relative of await listFiles(source, include)) {
        const data = await fs.readFile(path.join(source, relative));
        const { local, central } = zipEntry(`${prefix}/${relative}`, data, offset);
        locals.push(local);
        centrals.push(central);
        offset += local.length;
    }
    const directory = Buffer.concat(centrals);
    const end = zipHeader(ZIP_END, [
        [2, 0], [2, 0], [2, centrals.length], [2, centrals.length],
        [4, directory.length], [4, offset], [2, 0]
    ]);
    await fs.writeFile(outputPath, Buffer.concat([...locals, directory, end]));
}
