import { clear as clearFileWatchers } from '../../shared/fileWatcher.js';
import AppConfig from './appConfig.js';
import { readExtensionDirectories } from '../../shared/extensionManager.js';
import { withNewContext } from '../../ui/systems/objectUrlSystem.js';

const games = [];
let gameStylesheet = null;

/**
 * Loads a game's optional main.css bundle before its UI is initialized.
 * Replaces the previous game's stylesheet after the new one finishes loading.
 *
 * @param {object} game - Game metadata, including its directory path.
 * @returns {Promise<void>}
 */
async function loadGameStyles(game) {
    const cssPath = game.directory.url('main.css');
    let stylesheet = null;
    if (await game.directory.exists('main.css')) {
        stylesheet = document.createElement('link');
        stylesheet.rel = 'stylesheet';
        stylesheet.href = cssPath;
        await new Promise((resolve, reject) => {
            stylesheet.onload = resolve;
            stylesheet.onerror = () => {
                stylesheet.remove();
                reject(new Error(`Failed to load game stylesheet "${cssPath}".`));
            };
            document.head.appendChild(stylesheet);
        });
    }
    gameStylesheet?.remove();
    gameStylesheet = stylesheet;
}

export async function setGame(gameId) {
    const game = games.find(g => g.id === gameId);
    if (!game) throw new Error(`Could not find game "${gameId}"`);
    const { default: Module } = await import(game.directory.url('main.js'));
    await loadGameStyles(game);
    window.activeGame = new Module(game);
    await activeGame.init();
    await withNewContext(() => {
        clearFileWatchers();
        window.activeProject = new activeGame.Project();
    });
    activeGame.config = new AppConfig(gameId);
    return activeGame;
}

export async function loadGames() {
    const gameFolders = await readExtensionDirectories('games');
    for (const gameFolder of gameFolders) {
        log('startup').debug('Reading game:', gameFolder.url());
        if (!await gameFolder.exists('game.json')) continue;
        const game = await gameFolder.readJson('game.json');
        game.path = gameFolder.url().slice(1);
        game.directory = gameFolder;
        games.push(game);
    }
}
