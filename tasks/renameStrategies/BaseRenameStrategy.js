import path from 'node:path';

export default class BaseRenameStrategy {
    static matches(files) {
        const matchingFiles = [];
        for (const file of files) {
            const match = path.basename(file).match(this.pattern);
            if (match) matchingFiles.push({ file, match });
        }
        return matchingFiles;
    }

    constructor(matchingFiles) {
        this.matchingFiles = matchingFiles;
    }

    /**
     * @abstract
     * @param {RegExpMatchArray} match
     * @returns {string}
     */
    getNewFileName(match) {
        throw new Error('Not implemented.');
    }

    get operations() {
        return this.matchingFiles.map(({ file, match }) => ({
            source: file,
            destination: path.join(path.dirname(file), this.getNewFileName(match)),
        }));
    }
}
