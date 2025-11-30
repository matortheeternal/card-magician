import FrameModule from '../Frame/main.js';

export default class AdventureFrameModule extends FrameModule {
    async init(card) {
        this.frameOptions = this.makeReactive([
            { id: 'spotlight', label: 'Spotlight Adventure' },
            { id: 'reversed', label: 'Reversed Adventure' },
            { id: 'ub', label: 'Universes Beyond' },
        ]);
        await super.init(card, false);
    }

    resolveAsset(path) {
        if (path.startsWith('frame/spotlight'))
            return super.resolveAsset(path);
        return [
            'modules',
            this.modulePath.replace('AdventureFrame', 'Frame'),
            'assets',
            path
        ].join('/');
    }
}
