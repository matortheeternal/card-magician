import { checkFileExists, loadJson } from '../../shared/fsUtils.js';
import AppConfig from './appConfig.js';
import { readDirectory } from '../../shared/platformAdapter.js';
import { withNewContext } from '../../ui/systems/objectUrlSystem.js';

const games = [];
let appConfig = null;
let gameStylesheet = null;

/**
 * Loads a game's optional main.css bundle before its UI is initialized.
 * Replaces the previous game's stylesheet after the new one finishes loading.
 *
 * @param {object} game - Game metadata, including its directory path.
 * @returns {Promise<void>}
 */
async function loadGameStyles(game) {
    const cssPath = [game.path, 'main.css'].join('/');
    let stylesheet = null;
    if (await checkFileExists(cssPath)) {
        stylesheet = document.createElement('link');
        stylesheet.rel = 'stylesheet';
        stylesheet.href = '/' + cssPath;
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
    const mainPath = [game.path, 'main.js'].join('/');
    const { default: Module } = await import('/' + mainPath);
    await loadGameStyles(game);
    window.activeGame = new Module(game);
    await activeGame.init();
    await withNewContext(() => {
        window.activeProject = new activeGame.Project();
    });
    appConfig = new AppConfig(gameId);
    return activeGame;
}

export function getConfig() {
    return appConfig;
}

export async function loadGames() {
    const gameFolders = await readDirectory('games');
    for (const gameFolder of gameFolders) {
        log('startup').debug('Reading game:', gameFolder.path);
        const jsonPath = ['.', gameFolder.path, 'game.json'].join('/');
        if (!await checkFileExists(jsonPath)) {
            log('startup').debug('No game.json found at', jsonPath);
            continue;
        }
        const game = await loadJson(jsonPath);
        game.path = gameFolder.path;
        games.push(game);
    }
}
