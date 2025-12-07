import { loadImage } from '../../shared/imageUtils.js';

const operations = new Map();

function handleImageArg(arg) {
    const op = arg instanceof ImageOperation
        ? arg
        : new ImageOperation('source', [arg]);
    return op.execute();
}

export default class ImageOperation {
    static register(fn, numImageArgs = 0) {
        if (operations.has(fn.name))
            throw new Error(`Already registered operation ${fn.name}`)
        operations.set(fn.name, { fn, numImageArgs });
        return function() {
            return new ImageOperation(fn.name, arguments);
        };
    }

    constructor(name, args) {
        this.name = name;
        this.args = args;
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
        return await op.fn(...preparedArgs);
    }

    async publish(imageFormat = 'image/png', imageQuality = 0.92) {
        const canvas = await this.execute();
        const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, imageFormat, imageQuality);
        });
        return URL.createObjectURL(blob);
    }
}

ImageOperation.register(function source(str) {
    return loadImage(str);
});
