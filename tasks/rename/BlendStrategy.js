import BaseRenameStrategy from './BaseRenameStrategy.js';

const BLEND_FILENAME_PATTERN = /^(artifact|hybrid|multicolor)_blend_.+\.(jpg|png)$/;

export default class BlendStrategy extends BaseRenameStrategy {
    static pattern = BLEND_FILENAME_PATTERN;

    static matches(files) {
        const matchingFiles = super.matches(files);
        return matchingFiles.length === 3 ? matchingFiles : null;
    }

    getNewFileName(match) {
        return `blend_${match[1]}.${match[2]}`;
    }
}
