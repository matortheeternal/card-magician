import './main.css';
import '@shoelace-style/shoelace/dist/shoelace.js';
import './shared/extensions.js';
import './shared/localize.js';
import.meta.glob('./ui/**/*.js');
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import CardMagicianModule from './domain/template/CardMagicianModule.js';
import CardMagicianGame from './domain/game/CardMagicianGame.js';
import { loadTemplates } from './domain/template/templateRegistry.js';
import { loadGames, setGame } from './domain/game/gameManager.js';
import { setupTestHarness, runTests } from './tests';
import imageCache from './domain/graphics/ImageCache.js';
import Modal from './ui/modals/Modal.js';
import { shouldRunTests } from './shared/wailsAdapter.js';

// BASE SETUP
setupShoelace();
setupModuleSystem();

function setupShoelace() {
    setBasePath('/shoelace');
}

function setupModuleSystem() {
    window.CardMagicianModule = CardMagicianModule;
    window.CardMagicianGame = CardMagicianGame;
    window.Modal = Modal;
}

function loaded() {
    const titleBar = document.createElement('cm-title-bar');
    document.body.prepend(titleBar);
    document.querySelector('main').innerHTML = (
        `<cm-display-card></cm-display-card>
         <cm-set-view></cm-set-view>
         <cm-card-form></cm-card-form>`
    );
}

async function startApp() {
    if (await shouldRunTests()) {
        await setupTestHarness();
        await runTests();
        return;
    }
    await loadGames();
    await setGame('magic');
    await loadTemplates();
    await imageCache.preload();
    loaded();
}

startApp();
