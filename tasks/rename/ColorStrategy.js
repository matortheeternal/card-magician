import BaseRenameStrategy from './BaseRenameStrategy.js';

const COLOR_FILENAME_PATTERN = /^([abcgmruw]l?).+\.(png|jpg)$/;

export default class ColorStrategy extends BaseRenameStrategy {
    static pattern = COLOR_FILENAME_PATTERN;

    static matches(files) {
        const matchingFiles = super.matches(files);
        return matchingFiles.length >= 5 ? matchingFiles : null;
    }

    getNewFileName(match) {
        return `${match[1]}.${match[2]}`;
    }
}
