import ColorStrategy from './ColorStrategy.js';
import BlendStrategy from './BlendStrategy.js';

const Strategies = [ColorStrategy, BlendStrategy];

export function getRenameStrategy(files) {
    for (const Strategy of Strategies) {
        const matchingFiles = Strategy.matches(files);
        if (!matchingFiles) continue;
        return new Strategy(matchingFiles);
    }
}
