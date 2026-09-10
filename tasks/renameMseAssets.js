import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { getRenameStrategy } from './renameStrategyRegistry.js';
import GitStatusEntry from './GitStatusEntry.js';

function runGit(args, cwd) {
    return execFileSync('git', args, { cwd, encoding: 'utf8' });
}

function getGitRoot() {
    return runGit(['rev-parse', '--show-toplevel'], process.cwd()).trim();
}

function getRenameCandidates(root) {
    const output = runGit(
        ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--no-renames'],
        root
    );

    return output.split('\0')
        .map(GitStatusEntry.parse)
        .filter(entry => entry?.isRenameCandidate)
        .map(entry => entry.filePath);
}

function getRenameOperations(files) {
    const fileGroups = Map.groupBy(files, file => path.dirname(file));
    const operations = [];
    for (const group of fileGroups.values()) {
        const strategy = getRenameStrategy(group);
        if (!strategy) continue;
        operations.push(...strategy.operations);
    }
    return operations;
}

function renameFile(root, { source, destination }) {
    const sourcePath = path.join(root, source);
    const destinationPath = path.join(root, destination);

    if (fs.existsSync(destinationPath)) {
        console.warn(`Skipping ${source}: ${destination} already exists`);
        return;
    }

    console.log(`${source} -> ${destination}`);
    fs.renameSync(sourcePath, destinationPath);
}

function main() {
    const root = getGitRoot();
    const files = getRenameCandidates(root);
    const operations = getRenameOperations(files);
    operations.forEach(operation => renameFile(root, operation));
}

main();
