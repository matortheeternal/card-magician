import ClassicFrameModule from '../ClassicFrame/main.js';
import TokenFrame from './src/TokenFrame.js';

const TOKEN_OPTIONS = [
    'multicolorGradient', 'artifactGradient', 'hybridStyle', 'borderColor'
];

export default class ClassicTokenFrameModule extends ClassicFrameModule {
    static createOptions() {
        return super.createOptions().filter(opt => TOKEN_OPTIONS.includes(opt.id));
    }

    async init(card) {
        await super.init(card);
        card.frames = [TokenFrame];
    }
}
