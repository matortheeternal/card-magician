import { mount, readDirectory } from './shared/neutralinoAdapter.js';
import { buildLoadMseFileTests } from './domain/import/mse/loadMseFile.tests.js';
import { loadScript, loadStyle } from './shared/htmlUtils.js';

const JASMINE_BASE = 'https://cdn.jsdelivr.net/npm/jasmine-core@4.6.0/lib/jasmine-core';
const scripts = [
    `${JASMINE_BASE}/jasmine.js`,
    `${JASMINE_BASE}/jasmine-html.js`,
    `${JASMINE_BASE}/boot0.js`,
];
const jasmineStyle = `${JASMINE_BASE}/jasmine.css`;

export async function setupTestHarness() {
    document.querySelectorAll('main').forEach(el => el.remove());
    await mount('/tests', NL_PATH + '/tests');
    await loadStyle(jasmineStyle);
    for (const src of scripts)
        await loadScript(src);
    document.body.style.userSelect = 'auto';
    return true;
}

async function findTestFiles(dir) {
    const files = await readDirectory(dir);
    const testFiles = [];
    for (const file of files) {
        const path = `${dir}/${file.entry}`;
        if (file.type === 'DIRECTORY') {
            if (file.entry === '.' || file.entry === '..') continue;
            testFiles.push(...await findTestFiles(path));
        } else if (file.entry.endsWith('.tests.js')) {
            testFiles.push(path);
        }
    }
    return testFiles;
}

export async function buildModuleTests() {
    const testFiles = await findTestFiles('modules');
    for (const file of testFiles)
        await import(`/${file}`);
}

export async function runTests() {
    log('startup').info('--run-tests detected, loading test harness');
    await setupTestHarness();

    log('startup').info('Running tests');
    buildLoadMseFileTests();
    await buildModuleTests();

    await loadScript(`${JASMINE_BASE}/boot1.js`);
    if (document.readyState === 'complete') window.onload();
}

