import platform from '../../platformAdapter.js';
import YAMLSerializer from '../../../domain/projects/serializers/YAMLSerializer.js';
import { expectFilesToMatch } from '../testUtils.js';

export function readCardData(card) {
    return YAMLSerializer.load(card.files.get('data'));
}

export async function expectFileContent(path, expected) {
    expect(path).withContext('file path').toBeDefined();
    const bytes = await platform.readBinaryFile(path);
    await expectFilesToMatch(new File([bytes], ''), expected);
}

export async function expectFilesExist(paths) {
    for (const path of paths)
        expect(await platform.checkFileExists(path)).withContext(path).toBeTrue();
}

export async function expectFilesRemoved(paths) {
    for (const path of paths)
        expect(await platform.checkFileExists(path)).withContext(path).toBeFalse();
}

export function cardFilePaths(cards) {
    return cards.flatMap(card => [...card.files.entries].map(([, path]) => path));
}
