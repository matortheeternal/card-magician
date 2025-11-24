import { checkFileExists } from '../services/fsHelpers.js';
import { loadImage } from './imageProcessing.js';

export default class CachedImageRoutine {
    constructor(manager, coreFunction, numImageArgs, shortcut) {
        this.manager = manager;
        this.coreFunction = coreFunction;
        this.key = coreFunction.name;
        this.numImageArgs = numImageArgs;
        this.shortcut = shortcut;
        this.cache = new Map();
    }

    makeFilename(args) {
        const hash  = this.manager.hashArgs(args, this.numImageArgs);
        return `${this.key}_${hash}.png`;
    }

    async invokeCore(args) {
        const imageArgs = args.slice(0, this.numImageArgs);
        const otherArgs = args.slice(this.numImageArgs);
        const images = await Promise.all(imageArgs.map(loadImage));
        return this.coreFunction(...images, ...otherArgs);
    }

    async run(...args) {
        if (this.shortcut && !args[1])
            return args[0];

        const filename  = this.makeFilename(args);
        const localPath = `${this.manager.localPath}/${filename}`;
        const fullPath  = `${this.manager.cachePath}/${filename}`;

        if (this.cache.has(fullPath))
            return this.cache.get(fullPath);
        if (await checkFileExists(fullPath)) {
            this.cache.set(fullPath, localPath);
            return localPath;
        }

        console.debug("%cCache miss %s", "color:grey", fullPath);
        const canvas = await this.invokeCore(args);
        return await this.manager.save(fullPath, localPath, this.cache, canvas);
    }
}
