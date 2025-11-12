import {
    checkFileExists, loadJson, loadImport, getImageUrl, loadFont
} from './fsHelpers';

const games = [];

export const buildGameUtils = (gamePath) => ({
    async assetURL(path) {
        const filePath = [gamePath, 'assets', path].join('/');
        return await getImageUrl(filePath);
    },
    async loadFile(filename) {
        const filePath = [gamePath, filename].join('/');
        return await Neutralino.filesystem.readFile(filePath);
    },
    async loadFont(fontName, localPath) {
        const filePath = [gamePath, 'assets', localPath].join('/');
        await loadFont(fontName, filePath);
    },
    import(localPath) {
        const filePath = [gamePath, localPath].join('/');
        return loadImport(filePath);
    }
});

export async function setGame(gameId) {
    const game = games.find(g => g.id === gameId);
    if (!game) throw new Error('Could not find game:', gameId);
    const mainPath = [game.folder, 'main.js'].join('/');
    const module = await loadImport(mainPath);
    const moduleUtils = buildGameUtils(game.folder);
    await module(game, moduleUtils);
    return game;
}

export async function loadGames() {
    const gameFolders = await Neutralino.filesystem.readDirectory('games');
    for (let gameFolder of gameFolders) {
        console.info('Reading game from', gameFolder.path);
        const jsonPath = ['.', gameFolder.path, 'game.json'].join('/');
        if (!await checkFileExists(jsonPath)) {
            console.info('No game.json found at', jsonPath);
            continue;
        }
        const game = await loadJson(jsonPath);
        game.folder = gameFolder.path;
        game.columns = [];
        games.push(game);
    }
}
