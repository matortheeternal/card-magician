import CachedImageRoutine from './CachedImageRoutine.js';
import { loadImage } from './imageProcessing.js';
import { fnv1a } from '../utils.js';

const REVOKE_DELAY = 500;

export class CacheManager {
    constructor(basePath) {
        this.localPath = 'cache/images';
        this.cachePath = `${basePath}/${this.localPath}`;
        this.objectUrlMap = new Map();
        this.cachedRoutines = [];
        this.imageFormat = 'image/png';
        this.imageQuality = 0.92;
    }

    cacheRoutine(fn, numArgs, shortcut = false) {
        const routine = new CachedImageRoutine(this, fn, numArgs, shortcut);
        this.cachedRoutines.push(routine);
        return routine.run.bind(routine);
    }

    getMatchingRoutine(fn) {
        return this.cachedRoutines.find(r => fn.startsWith(r.key));
    }

    hashArgs(args, numImageArgs) {
        const normalizedArgs = args.slice(0, numImageArgs).map(arg => {
            return this.objectUrlMap.get(arg) ?? arg;
        }).concat(args.slice(numImageArgs));
        return fnv1a(normalizedArgs.join('|'));
    }

    async save(fullPath, localPath, cache, canvas) {
        const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, this.imageFormat, this.imageQuality);
        });
        blob.arrayBuffer().then(async arrayBuffer => {
            const uint8 = new Uint8Array(arrayBuffer);
            await Neutralino.filesystem.writeBinaryFile(fullPath, uint8);
            const objectUrl = cache.get(fullPath);
            cache.set(fullPath, localPath);
            setTimeout(() => URL.revokeObjectURL(objectUrl), REVOKE_DELAY);
        });
        const objectUrl = URL.createObjectURL(blob);
        this.objectUrlMap.set(objectUrl, localPath);
        cache.set(fullPath, objectUrl);
        return objectUrl;
    }

    async preload() {
        const entries = await Neutralino.filesystem.readDirectory(this.cachePath);
        for (const { type, entry } of entries) {
            if (type !== 'FILE') continue;
            const routine = this.getMatchingRoutine(entry);
            if (!routine) continue;
            const localPath = `${this.localPath}/${entry}`
            const fullPath = `${this.cachePath}/${entry}`;
            await loadImage(fullPath);
            routine.cache.set(fullPath, localPath);
        }
    }

    clearAll() {
        this.cachedRoutines.forEach(routine => routine.cache.clear());
        this.objectUrlMap.forEach(url => URL.revokeObjectURL(url));
        this.objectUrlMap.clear();
    }
}

const cacheManager = new CacheManager(NL_DATAPATH);
export default cacheManager;
