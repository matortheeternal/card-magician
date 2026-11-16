import { loadImage } from '../../shared/imageUtils.js';
import imageCache from './ImageCache.js';
import { fnv1a } from '../../shared/fsUtils.js';

const operations = new Map();
const pendingPublishes = new Map();

function handleImageArg(arg) {
    const op = arg instanceof ImageOp
        ? arg
        : new ImageOp('source', [arg]);
    return op.execute();
}

export default class ImageOp {
    static register(fn, numImageArgs = 0) {
        if (operations.has(fn.name))
            throw new Error(`Already registered operation ${fn.name}`);
        operations.set(fn.name, { fn, numImageArgs });
        return function() {
            return new ImageOp(fn.name, arguments);
        };
    }

    constructor(name, args) {
        this.name = name;
        this.args = args;
    }

    makeFilename(imageFormat) {
        const hash = fnv1a(JSON.stringify(this));
        const ext = imageFormat.split('/').pop();
        return `img-${hash}.${ext}`;
    }

    async execute() {
        const op = operations.get(this.name);
        if (!op) throw new Error(`Unknown operation ${this.name}`);

        const argPromises = [];
        for (let i = 0; i < this.args.length; i++) {
            const arg = this.args[i];
            const res = i < op.numImageArgs ? handleImageArg(arg) : arg;
            argPromises.push(res);
        }

        const preparedArgs = await Promise.all(argPromises);
        return op.fn(...preparedArgs);
    }

    async publish(imageFormat = 'image/png', imageQuality = 0.92) {
        const filename = this.makeFilename(imageFormat);
        if (imageCache.has(filename))
            return imageCache.get(filename);
        if (!pendingPublishes.has(filename)) {
            log('cache').debug(`Cache miss ${filename}`);
            const save = canvas =>
                imageCache.save(filename, canvas, imageFormat, imageQuality);
            const result = this.execute().then(save)
                .finally(() => pendingPublishes.delete(filename));
            pendingPublishes.set(filename, result);
        }
        return pendingPublishes.get(filename);
    }
}

ImageOp.register(function source(str) {
    return loadImage(str);
});
