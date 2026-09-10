import ColorStrategy from './renameStrategies/ColorStrategy.js';
import BlendStrategy from './renameStrategies/BlendStrategy.js';

const Strategies = [ColorStrategy, BlendStrategy];

export function getRenameStrategy(files) {
    for (const Strategy of Strategies) {
        const matchingFiles = Strategy.matches(files);
        if (!matchingFiles) continue;
        return new Strategy(matchingFiles);
    }
}
