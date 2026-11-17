import '../../domain/game/CardMagicianGame.js';
import '../../domain/card/CardMagicianCard.js';
import '../../domain/card/CardFileDefinition.js';
import '../../domain/card/CardImageFileDefinition.js';
import '../../domain/projects/CardMagicianProject.js';
import '../../domain/template/CardMagicianModule.js';
import '../../ui/settings/CardMagicianSettings.js';
import { getGames, loadGames, setGame } from '../../domain/game/gameManager.js';
import { loadTemplates } from '../../domain/template/templateRegistry.js';

const loadedGames = new Map();

async function loadGame(gameId) {
    if (!getGames().length) {
        await loadGames();
        await loadTemplates();
    }
    return setGame(gameId);
}

export function useGame(gameId) {
    let previousGame, previousProject;

    beforeAll(async () => {
        previousGame = window.activeGame;
        previousProject = window.activeProject;
        if (!loadedGames.has(gameId)) loadedGames.set(gameId, loadGame(gameId));
        window.activeGame = await loadedGames.get(gameId);
        window.activeProject = new activeGame.Project();
    });

    afterAll(() => {
        window.activeGame = previousGame;
        window.activeProject = previousProject;
    });
}
