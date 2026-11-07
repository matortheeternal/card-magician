import BaseRenameStrategy from './BaseRenameStrategy.js';

export default class BlendStrategy extends BaseRenameStrategy {
    static pattern = /^(artifact|hybrid|multicolor)_blend_.+\.(jpg|png)$/;

    static matches(files) {
        const matchingFiles = super.matches(files);
        return matchingFiles.length === 3 ? matchingFiles : null;
    }

    getNewFileName(match) {
        return `blend_${match[1]}.${match[2]}`;
    }
}
