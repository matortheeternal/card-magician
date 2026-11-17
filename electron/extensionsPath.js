import path from 'node:path';

export function resolveExtensionsPath({ root, profile, isDevelopment, override }) {
    const defaultPath = isDevelopment
        ? path.join(root, 'extensions')
        : path.join(profile, 'extensions');
    return path.resolve(override ?? defaultPath);
}
