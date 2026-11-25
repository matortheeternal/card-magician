import { getModuleClass } from './moduleRegistry.js';
import { useGame } from '../../shared/testing/gameFixture.js';

function createModule(modulePath) {
    const Module = getModuleClass(modulePath);
    return new Module({}, modulePath);
}

describe('Module registry', () => {
    useGame('magic');

    it('loads every module for the active game with its metadata', () => {
        const Footer = getModuleClass('magic/M15/Footer');
        expect(Footer.moduleMetadata.id).toBe('magic/M15/Footer');
        expect(Footer.moduleMetadata.gameId).toBe('magic');
    });

    it('shares module classes with modules that extend them', () => {
        const Footer = getModuleClass('magic/M15/Footer');
        const ClassicFooter = getModuleClass('magic/Classic/ClassicFooter');
        expect(Object.getPrototypeOf(ClassicFooter)).toBe(Footer);
        expect(ClassicFooter.moduleMetadata.id).toBe('magic/Classic/ClassicFooter');
        expect(Footer.moduleMetadata.id).toBe('magic/M15/Footer');
    });

    it('loads style.css unless module.json lists stylesheets', () => {
        expect(getModuleClass('magic/M15/Footer').ownStylesheets.length).toBe(1);
        expect(getModuleClass('magic/M15/Text').ownStylesheets.length).toBe(3);
        expect(getModuleClass('magic/M15/AutoNumber').ownStylesheets).toEqual([]);
    });

    it('resolves assets from the nearest module that includes them', () => {
        const footer = createModule('magic/Classic/ClassicFooter');
        const name = createModule('magic/Classic/ClassicName');
        expect(footer.resolveAsset('art.png'))
            .toContain('magic/M15/Footer/assets/art.png');
        expect(name.resolveAsset('magicmedieval.ttf'))
            .toContain('magic/Classic/ClassicName/assets/magicmedieval.ttf');
    });

    it('returns nothing for unknown modules', () => {
        expect(getModuleClass('magic/M15/Missing')).toBeUndefined();
    });
});
