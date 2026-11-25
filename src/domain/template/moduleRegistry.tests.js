import { getModuleClass } from './moduleRegistry.js';
import { useGame } from '../../shared/testing/gameFixture.js';

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

    it('returns nothing for unknown modules', () => {
        expect(getModuleClass('magic/M15/Missing')).toBeUndefined();
    });
});
