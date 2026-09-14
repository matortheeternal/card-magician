import { getSettingsTabs, registerSettings } from './settingsRegistry.js';

describe('getSettingsTabs', () => {
    class LaterRoot {
        static id = 'later-root';
        static parentId = null;
        static groupWeight = 20;
    }

    class LaterChild {
        static id = 'later-child';
        static parentId = 'earlier-root';
        static groupWeight = 20;
    }

    class Grandchild {
        static id = 'grandchild';
        static parentId = 'earlier-child';
        static groupWeight = 10;
    }

    class EarlierRoot {
        static id = 'earlier-root';
        static parentId = null;
        static groupWeight = 10;
    }

    class Orphan {
        static id = 'orphan';
        static parentId = 'missing-parent';
        static groupWeight = 0;
    }

    class EarlierChild {
        static id = 'earlier-child';
        static parentId = 'earlier-root';
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
