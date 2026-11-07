import BaseRenameStrategy from './BaseRenameStrategy.js';

export default class ColorStrategy extends BaseRenameStrategy {
    static pattern = /^([abcgmruw]l?).+\.(png|jpg)$/;

    static matches(files) {
        const matchingFiles = super.matches(files);
        return matchingFiles.length >= 5 ? matchingFiles : null;
    }

    getNewFileName(match) {
        return `${match[1]}.${match[2]}`;
    }
}
