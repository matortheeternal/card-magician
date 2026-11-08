import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const GIT_URL_PREFIX_PATTERN = /^git\+/;
const GIT_URL_SUFFIX_PATTERN = /\.git$/;

function shellQuote(value) {
    return `'${String(value).replaceAll('\'', '\'\\\'\'')}'`;
}

async function generatePkgbuild(debPath) {
    const text = await readFile('package.json', 'utf8');
    const manifest = JSON.parse(text);

    const version = manifest.version;
    const pkgver = version.replaceAll('-', '_');
    const debName = path.basename(debPath);
    const repository = typeof manifest.repository === 'string'
        ? manifest.repository
        : manifest.repository.url;
    const repoUrl = repository
        .replace(GIT_URL_PREFIX_PATTERN, '')
        .replace(GIT_URL_SUFFIX_PATTERN, '');
    const sha256 = createHash('sha256')
        .update(await readFile(debPath))
        .digest('hex');
    const depends = [
        'gtk3', 'nss', 'libxss', 'libxtst',
        'libnotify', 'at-spi2-core', 'libsecret',
        'xdg-utils'
    ];

    return [
        `pkgname=card-magician-bin`,
        `pkgver=${pkgver}`,
        `pkgrel=1`,
        `pkgdesc=${shellQuote(manifest.description)}`,
        `arch=('x86_64')`,
        `url=${shellQuote(repoUrl)}`,
        `license=(${shellQuote(manifest.license)})`,
        `depends=(${depends.map(s => `'${s}'`).join(' ')})`,
        `provides=('card-magician')`,
        `conflicts=('card-magician')`,
        `options=('!strip')`,
        ``,
        `_debfile=${shellQuote(debName)}`,
        `source=("\${_debfile}::\${url}/releases/download/v${version}/\${_debfile}")`,
        `sha256sums=('${sha256}')`,
        `noextract=("\${_debfile}")`,
        ``,
        `prepare() {`,
        `    mkdir -p "$srcdir/deb"`,
        `    bsdtar -xf "$srcdir/$_debfile" -C "$srcdir/deb"`,
        `}`,
        ``,
        `package() {`,
        `    bsdtar -xf "$srcdir/deb"/data.tar.* -C "$pkgdir"`,
        `}`,
    ].join('\n');
}

async function createPkgbuildFile(debPath, result) {
    const pkgbuild = await generatePkgbuild(debPath);
    const aurDir = path.join(result.outDir, 'aur');
    await mkdir(aurDir, { recursive: true });
    const pkgbuildPath = path.join(aurDir, 'PKGBUILD');
    await writeFile(pkgbuildPath, pkgbuild);
    console.log(`[aur] Generated ${pkgbuildPath}`);
}

function checkPlatform() {
    if (process.platform !== 'linux' || process.arch !== 'x64') {
        console.log('[aur] Skipping makepkg: requires Linux x64.');
        return false;
    }
    return true;
}

function notRoot() {
    if (process.getuid?.() === 0) {
        console.log('[aur] Skipping makepkg: cannot run as root.');
        return false;
    }
    return true;
}

function makepkgInstalled() {
    const probe = spawnSync('makepkg', ['--version'], { stdio: 'ignore' });
    if (probe.error?.code === 'ENOENT') {
        console.log('[aur] makepkg not installed; PKGBUILD generated only.');
        return false;
    }
    if (probe.error) throw probe.error;
    if (probe.status !== 0) {
        console.warn('[aur] makepkg is unavailable or not working.');
        return false;
    }

    return true;
}

async function buildAurPackage(aurDir, debPath, outDir) {
    if (!checkPlatform() || !notRoot() || !makepkgInstalled()) return;

    const env = {
        ...process.env,
        PKGDEST: path.resolve(outDir),
        SRCDEST: path.resolve(path.dirname(debPath))
    };

    console.log('[aur] Generating .SRCINFO...');

    const srcInfo = spawnSync('makepkg', ['--printsrcinfo'], {
        cwd: aurDir,
        env,
        encoding: 'utf8'
    });

    if (srcInfo.error) throw srcInfo.error;
    if (srcInfo.status !== 0)
        throw new Error(`[aur] .SRCINFO generation failed:\n${srcInfo.stderr}`);

    const srcinfoPath = path.join(aurDir, '.SRCINFO');
    await writeFile(srcinfoPath, srcInfo.stdout);
    console.log('[aur] Building native Arch package...');

    const result = spawnSync('makepkg', [
        '--force',
        '--cleanbuild',
        '--clean',
        '--nodeps'
    ], {
        cwd: aurDir,
        env,
        stdio: 'inherit'
    });

    if (result.error) throw result.error;
    if (result.status !== 0)
        throw new Error(`[aur] makepkg failed with exit code ${result.status}`);

    console.log(`[aur] Arch package generated in ${path.resolve(outDir)}`);
}

export default async function generateAurPackage(result) {
    const debPath = result.artifactPaths.find(file => file.endsWith('-amd64.deb'));
    if (!debPath) return;

    await createPkgbuildFile(debPath, result);
    const aurDir = path.join(result.outDir, 'aur');
    await mkdir(aurDir, { recursive: true });
    await buildAurPackage(aurDir, debPath, result.outDir);
}
