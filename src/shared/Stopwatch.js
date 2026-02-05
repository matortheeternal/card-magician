export default class Stopwatch {
    constructor(group) {
        this.group = group;
        this.startTime = performance.now();
        this.lastTime = this.startTime;
    }

    lap(label) {
        const lapTime = (performance.now() - this.lastTime).toFixed(2);
        log(this.group).debug(`${label}: ${lapTime}ms`);
        this.lastTime = performance.now();
    }

    complete(label) {
        const completionTime = (performance.now() - this.startTime).toFixed(2);
        log(this.group).debug(`${label} completed in ${completionTime}ms`);
    }
}
