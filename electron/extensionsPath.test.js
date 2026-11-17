import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { resolveExtensionsPath } from './extensionsPath.js';

const root = path.resolve('/app');
const profile = path.resolve('/profile');

test('uses the profile extensions folder outside development', () => {
    const resolved = resolveExtensionsPath({ root, profile, isDevelopment: false });
    assert.equal(resolved, path.join(profile, 'extensions'));
});

test('uses the checkout extensions folder in development', () => {
    const resolved = resolveExtensionsPath({ root, profile, isDevelopment: true });
    assert.equal(resolved, path.join(root, 'extensions'));
});

test('resolves an override relative to the working directory', () => {
    const override = '.tmp/test extensions';
    const resolved = resolveExtensionsPath({
        root, profile, isDevelopment: true, override
    });
    assert.equal(resolved, path.resolve(override));
});
