export default class DebouncedInvocation {
    constructor(func) {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
        this.func = func;
    }

    apply(context, args) {
        this.context = context;
        this.args = args;
    }

    execute() {
        Promise.resolve()
            .then(() => this.func.apply(this.context, this.args))
            .then(this.resolve, this.reject);
        return this.promise;
    }

    cancel() {
        this.resolve();
    }
}
