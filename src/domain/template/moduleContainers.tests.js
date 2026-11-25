import { getModuleClass } from './moduleRegistry.js';
import { resolveContainerNames } from './moduleContainers.js';
import { useGame } from '../../shared/testing/gameFixture.js';

function createCard(html, modulePaths, subcardKey = null) {
    const renderRoot = document.createElement('div');
    renderRoot.innerHTML = html;
    const card = { renderRoot, subcardKey, modules: [] };
    for (const modulePath of modulePaths) {
        const Module = getModuleClass(modulePath);
        card.modules.push(new Module(card, modulePath));
    }
    return card;
}

function containerNames(card) {
    return card.modules.map(module => module.containerName);
}

describe('Module containers', () => {
    useGame('magic');

    it('lists a module name before the names of the modules it extends', () => {
        const ClassicFooter = getModuleClass('magic/Classic/ClassicFooter');
        expect([...ClassicFooter.containerNames]).toEqual(['ClassicFooter', 'Footer']);
    });

    it('renders into containers named after the module', () => {
        const card = createCard(
            '<module-container module="ClassicFooter"></module-container>'
            + '<module-container module="Footer"></module-container>',
            ['magic/Classic/ClassicFooter']
        );
        resolveContainerNames(card);
        expect(containerNames(card)).toEqual(['ClassicFooter']);
    });

    it('renders into containers named after an extended module', () => {
        const card = createCard(
            '<module-container module="Footer"></module-container>',
            ['magic/Classic/ClassicFooter']
        );
        resolveContainerNames(card);
        expect(containerNames(card)).toEqual(['Footer']);
    });

    it('leaves containers to the loaded module that owns their name', () => {
        const card = createCard(
            '<module-container module="Footer"></module-container>',
            ['magic/Classic/ClassicFooter', 'magic/M15/Footer']
        );
        resolveContainerNames(card);
        expect(containerNames(card)).toEqual(['ClassicFooter', 'Footer']);
    });

    it('matches extended module containers for the same subcard', () => {
        const html = '<module-container module="Footer" subcard="top">'
            + '</module-container>';
        const top = createCard(html, ['magic/Classic/ClassicFooter'], 'top');
        const bottom = createCard(html, ['magic/Classic/ClassicFooter'], 'bottom');
        resolveContainerNames(top);
        resolveContainerNames(bottom);
        expect(containerNames(top)).toEqual(['Footer']);
        expect(containerNames(bottom)).toEqual(['ClassicFooter']);
    });
});
