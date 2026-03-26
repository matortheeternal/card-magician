import { readDirectory, readFile, writeFile } from '../../shared/neutralinoAdapter.js';
import { getActiveGame } from '../game/gameManager.js';
import sanitize from 'sanitize-filename';
import { getActiveSet } from '../sets/setManager.js';

const loadedScripts = [];

export async function loadScripts() {
    const entries = await readDirectory('scripts');
    for (const { entry, type, path } of entries) {
        if (type !== 'FILE') continue;
        loadedScripts.push({
            name: entry,
            source: await readFile(path, 'utf8')
        });
    }
}

export function getScripts() {
    return loadedScripts.slice();
}

function findOrCreateScript(script) {
    const storedScript = loadedScripts.find(s => s.name === script.id);
    const name = sanitize(
        (script.name + '.js').normalize('NFC'),
        { replacement: '-' }
    );
    if (storedScript) {
        storedScript.name = name;
        return storedScript;
    }
    const newScript = { name };
    loadedScripts.push(newScript);
    return newScript;
}

export async function saveScript(inputScript) {
    const script = findOrCreateScript(inputScript);
    script.source = inputScript.source;
    return writeFile(`./scripts/${script.name}`, script.source);
}

function getCards(target) {
    const listView = document.querySelector('cm-list-view');
    const targetRows = target?.id === 'all'
        ? listView.activeRows
        : listView.selection;
    return targetRows.map(row => row.original);
}

export function runScript(script, target) {
    const game = getActiveGame();
    const activeSet = getActiveSet();
    const logger = log('script');
    const addCard = function() {
        const card = game.newCard();
        activeSet.cards.push(card);
        return card;
    };

    const scriptFunction = new Function(
        'card', 'logger', 'addCard', 'game',
        script.source
    );
    for (const card of getCards(target)) {
        const cardName = game.getCardName(card);
        try {
            logger.info(`Applying ${script.name} to ${cardName}`);
            scriptFunction(card, logger, addCard, game);
        } catch (err) {
            logger.error('Failed to apply script to card', err);
            break;
        } finally {
            changed(activeSet, 'cards');
        }
    }
}
