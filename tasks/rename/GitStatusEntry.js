export default class GitStatusEntry {
    static parse(line) {
        if (!line) return null;
        return new GitStatusEntry(
            line.slice(0, 2),
            line.slice(3)
        );
    }

    constructor(statusCode, filePath) {
        this.statusCode = statusCode;
        this.filePath = filePath;
    }

    get isDeleted() {
        return this.statusCode.includes('D');
    }

    get isModified() {
        return this.statusCode.includes('M');
    }

    get isAdded() {
        return this.statusCode.includes('A');
    }

    get isUntracked() {
        return this.statusCode === '??';
    }

    get isRenameCandidate() {
        return !this.isDeleted
            && (this.isUntracked || this.isModified || this.isAdded);
    }
}
