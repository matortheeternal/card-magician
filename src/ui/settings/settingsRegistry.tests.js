import { getSettingsTabs, registerSettings } from './settingsRegistry.js';

describe('getSettingsTabs', () => {
    class LaterRoot {
        static id = 'cm-later-root';
        static parentId = null;
        static groupWeight = 0;
    }

    class LaterChild {
        static id = 'cm-later-child';
        static parentId = 'cm-earlier-root';
        static groupWeight = 0;
    }

    class Grandchild {
        static id = 'cm-grandchild';
        static parentId = 'cm-earlier-child';
        static groupWeight = 10;
    }

    class EarlierRoot {
        static id = 'cm-earlier-root';
        static parentId = null;
        static groupWeight = 10;
    }

    class Orphan {
        static id = 'cm-orphan';
        static parentId = 'cm-missing-parent';
        static groupWeight = 20;
    }

    class EarlierChild {
        static id = 'cm-earlier-child';
        static parentId = 'cm-earlier-root';
        static groupWeight = 10;
    }

    beforeAll(() => {
        [
            LaterRoot,
            LaterChild,
            Grandchild,
            EarlierRoot,
            Orphan,
            EarlierChild,
        ].forEach(registerSettings);
    });

    it('returns tabs in weighted depth-first order', () => {
        expect(getSettingsTabs()).toEqual([
            EarlierRoot,
            EarlierChild,
            Grandchild,
            LaterChild,
            LaterRoot,
        ]);
    });

    it('excludes tabs whose parent is not registered', () => {
        expect(getSettingsTabs()).not.toContain(Orphan);
    });
});
