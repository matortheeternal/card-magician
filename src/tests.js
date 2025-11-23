import {
    buildCombineBlendTests,
    buildLinearBlendTests,
    buildMaskBlendTests
} from './tests/blendTests';

const JASMINE_BASE = 'https://cdn.jsdelivr.net/npm/jasmine-core@4.6.0/lib/jasmine-core';
const scripts = [
    `${JASMINE_BASE}/jasmine.js`,
    `${JASMINE_BASE}/jasmine-html.js`,
    `${JASMINE_BASE}/boot0.js`,
    `${JASMINE_BASE}/boot1.js`
];
const jasmineStyle = `${JASMINE_BASE}/jasmine.css`;

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load Jasmine script: ${src}`));
        document.head.appendChild(script);
    });
}

function loadStyle(href) {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = resolve;
        link.onerror = () => reject(new Error('Failed to load Jasmine CSS'));
        document.head.appendChild(link);
    });
}

export async function setupTestHarness() {
    await loadStyle(jasmineStyle);
    for (const src of scripts)
        await loadScript(src);
    document.querySelectorAll('nav, template').forEach(el => el.remove());
    document.body.style.userSelect = 'auto';
    return true;
}

export async function runTests() {
    buildCombineBlendTests();
    buildLinearBlendTests();
    buildMaskBlendTests();
    buildImportTests();
}
