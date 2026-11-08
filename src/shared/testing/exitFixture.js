import { beforeExit } from '../../lifecycle.js';
import platform from '../platformAdapter.js';
import ImageFieldValue from '../../domain/card/ImageFieldValue.js';
import ImageCrop from '../../domain/card/ImageCrop.js';
import CollectionManager from '../storage/CollectionManager.js';

const DEBOUNCE_DELAY = 60_000;

export async function setupExitFixture() {
    if (!appEnvironment.id.startsWith('cardmagician.exit.'))
        throw new Error('Exit smoke tests require an isolated application ID.');
    const argument = appEnvironment.args.find(value => {
        return value.startsWith('--exit-test-folder=');
    });
    if (!argument) throw new Error('Exit smoke tests require a temporary data folder.');
    const folder = argument.slice('--exit-test-folder='.length);
    const manager = activeGame.faceSymbolManager;
    manager.options.path = () => [folder, 'symbols.yml'];
    await manager.load();
    if (!appEnvironment.args.includes('--exit-test-reopen')) {
        manager.collection = [];
        const symbol = manager.create('Exit smoke symbol');
        symbol.image = new ImageFieldValue(
            'data:image/svg+xml;base64,'
                + btoa('<svg xmlns="http://www.w3.org/2000/svg" '
                    + 'width="12" height="18"/>'),
            12, 18, new ImageCrop(12, 18)
        );
    }
    // Drain setup writes before replacing the debounce. A normal timer must not
    // satisfy the shutdown assertion when collection flushing is disabled.
    await manager.flush();
    manager.save = CollectionManager.prototype.save.debounce(DEBOUNCE_DELAY);
    const editor = document.createElement('cm-edit-face-symbol');
    editor.symbol = manager.collection[0];
    document.querySelector('main').replaceChildren(editor);
    let released = false;
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    beforeExit(() => released ? undefined : gate, () => false);
    window.exitSmoke = {
        debounceDelay: DEBOUNCE_DELAY,
        get pending() { return manager.pending; },
        get imageUrl() { return manager.collection[0].image?.imageUrl; },
        release() { released = true; release(); },
        terminate: code => platform.terminateApp(code),
        dataPath: appEnvironment.paths.data,
        filePath: await platform.getJoinedPath(folder, 'symbols.yml')
    };
}
