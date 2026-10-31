import { beforeExit } from '../../lifecycle.js';
import { getJoinedPath, terminateApp } from '../neutralinoAdapter.js';
import ImageFieldValue from '../../domain/card/ImageFieldValue.js';
import ImageCrop from '../../domain/card/ImageCrop.js';

/** Test-only gate for observing shutdown; filesystem writes remain real. */
export async function setupExitFixture() {
    if (!NL_APPID.startsWith('cardmagician.exit.'))
        throw new Error('Exit smoke tests require an isolated application ID.');
    const argument = NL_ARGS.find(value => value.startsWith('--exit-test-folder='));
    if (!argument) throw new Error('Exit smoke tests require a temporary data folder.');
    const folder = argument.slice('--exit-test-folder='.length);
    const manager = activeGame.faceSymbolManager;
    manager.options.path = () => [folder, 'symbols.yml'];
    await manager.load();
    if (!NL_ARGS.includes('--exit-test-reopen')) {
        manager.collection = [];
        const symbol = manager.create('Exit smoke symbol');
        symbol.image = new ImageFieldValue(
            'data:image/svg+xml;base64,'
                + btoa('<svg xmlns="http://www.w3.org/2000/svg" '
                    + 'width="12" height="18"/>'),
            12, 18, new ImageCrop(12, 18)
        );
        await manager.flush();
    }
    const editor = document.createElement('cm-edit-face-symbol');
    editor.symbol = manager.collection[0];
    document.querySelector('main').replaceChildren(editor);
    let released = false;
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    beforeExit(() => released ? undefined : gate, () => false);
    window.exitSmoke = {
        get pending() { return manager.pending; },
        get imageUrl() { return manager.collection[0].image?.imageUrl; },
        release() { released = true; release(); },
        terminate: terminateApp,
        dataPath: NL_DATAPATH,
        filePath: await getJoinedPath(folder, 'symbols.yml')
    };
}
