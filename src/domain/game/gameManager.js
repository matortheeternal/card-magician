import { checkFileExists, loadJson } from '../../shared/fsUtils.js';
import { sifter } from './search.js';
import { readDirectory } from '../../shared/neutralinoAdapter.js';

const games = [];

export async function setGame(gameId) {
    const game = games.find(g => g.id === gameId);
    if (!game) throw new Error('Could not find game:', gameId);
    const mainPath = [game.path, 'main.js'].join('/');
    const { default: Module } = await import('/' + mainPath);
    const activeGame = await new Module(game.path);
    await activeGame.init();
    activeGame.setupSearch(sifter);
    Alpine.store('views').activeSet = activeGame.newSet();
    return activeGame;
}

export async function loadGames() {
    const gameFolders = await readDirectory('games');
    for (const gameFolder of gameFolders) {
        console.debug('%cReading game:', 'color:gold', gameFolder.path);
        const jsonPath = ['.', gameFolder.path, 'game.json'].join('/');
        if (!await checkFileExists(jsonPath)) {
            console.debug('No game.json found at', jsonPath);
            continue;
        }
        const game = await loadJson(jsonPath);
        game.path = gameFolder.path;
        games.push(game);
    }
}
