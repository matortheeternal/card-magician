import FrameModule from '../Frame/main.js';
import { FrameFolderRule } from '../Frame/src/frameFolders.js';

export default class AdventureFrameModule extends FrameModule {
    async init(card) {
        await super.init(card, false);
        this.frameOptions = this.makeReactive([
            { id: 'spotlight', label: 'Spotlight Adventure' },
            { id: 'reversed', label: 'Reversed Adventure' },
            { id: 'ub', label: 'Universes Beyond' },
        ]);
        const spotlightRule = new FrameFolderRule(
            'spotlight',
            card => card.frame.spotlight,
            '.png'
        );
        this.folderRegistry.rules.unshift(spotlightRule);
    }

    resolveAsset(path) {
        if (path.startsWith('frame/spotlight'))
            return super.resolveAsset(path);
        const frameModulePath = this.modulePath.replace('/AdventureFrame', '/Frame');
        return ['modules', frameModulePath, 'assets', path].join('/');
    }
}
