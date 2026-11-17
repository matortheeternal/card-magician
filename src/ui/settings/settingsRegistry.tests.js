import { getSettingsTabs, registerSettings } from './settingsRegistry.js';

describe('getSettingsTabs', () => {
    class LaterRoot {
        static id = 'cm-later-root';
        static parentId = null;
        static groupWeight = 0;
        static hide() { return false; }
    }

    class LaterChild {
        static id = 'cm-later-child';
        static parentId = 'cm-earlier-root';
        static groupWeight = 0;
        static hide() { return false; }
    }

    class Grandchild {
        static id = 'cm-grandchild';
        static parentId = 'cm-earlier-child';
        static groupWeight = 10;
        static hide() { return false; }
    }

    class EarlierRoot {
        static id = 'cm-earlier-root';
        static parentId = null;
        static groupWeight = 10;
        static hide() { return false; }
    }

    class Orphan {
        static id = 'cm-orphan';
        static parentId = 'cm-missing-parent';
        static groupWeight = 20;
        static hide() { return false; }
    }

    class EarlierChild {
        static id = 'cm-earlier-child';
        static parentId = 'cm-earlier-root';
        static groupWeight = 10;
        static hide() { return false; }
    }

    const registered = [
        LaterRoot,
        LaterChild,
        Grandchild,
        EarlierRoot,
        Orphan,
        EarlierChild,
    ];

    function registeredTabs() {
        return getSettingsTabs().filter(tab => registered.includes(tab));
    }

    beforeAll(() => {
        registered.forEach(registerSettings);
    });

    it('returns tabs in weighted depth-first order', () => {
        expect(registeredTabs()).toEqual([
            EarlierRoot,
            EarlierChild,
            Grandchild,
            LaterChild,
            LaterRoot,
        ]);
    });

    it('excludes tabs whose parent is not registered', () => {
        expect(registeredTabs()).not.toContain(Orphan);
    });
});
