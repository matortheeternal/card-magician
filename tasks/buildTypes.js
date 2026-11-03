import { execFileSync } from 'node:child_process';
import { appendFile, copyFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';

const require = createRequire(import.meta.url);
const extractorRequire = createRequire(require.resolve('@microsoft/api-extractor'));

const projectFolder = fileURLToPath(new URL('../', import.meta.url));
const typesFolder = path.join(projectFolder, 'dist/types');
const bundlePath = path.join(projectFolder, 'dist/card-magician.d.ts');
const compilerFolder = path.dirname(extractorRequire.resolve('typescript/package.json'));
const sourcePath = path.join(projectFolder, 'src/card-magician.d.ts');
const outputPath = path.join(typesFolder, 'card-magician.d.ts');
const globalsPath = path.join(projectFolder, 'src/card-magician-globals.d.ts');
const bridgeOutputPath = path.join(typesFolder, 'card-magician-globals.d.ts');

function runCompiler(configPath) {
    execFileSync(process.execPath, [
        path.join(compilerFolder, 'bin/tsc'), '--project', configPath
    ], { cwd: projectFolder, stdio: 'inherit' });
}

async function copyEntrypoints() {
    await mkdir(typesFolder, { recursive: true });
    await copyFile(sourcePath, outputPath);
    await copyFile(globalsPath, bridgeOutputPath);
}

function bundleDeclarations() {
    const config = ExtractorConfig.loadFileAndPrepare(
        path.join(projectFolder, 'api-extractor.json'));
    const result = Extractor.invoke(config, { localBuild: true });
    if (!result.succeeded) throw new Error('Extension API extraction failed');
}

async function appendGlobalDeclarations() {
    const globals = await readFile(globalsPath, 'utf8');
    await appendFile(bundlePath, `\n${globals}`);
}

async function buildTypes() {
    runCompiler('tsconfig.ext.json');
    await copyEntrypoints();
    bundleDeclarations();
    await appendGlobalDeclarations();
    runCompiler('tasks/types/tsconfig.json');
}

buildTypes().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
