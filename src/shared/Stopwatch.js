export default class Stopwatch {
    constructor(label) {
        this.label = label;
        this.startTime = performance.now();
        this.lastTime = this.startTime;
    }

    lap(lapLabel) {
        const lapTime = (performance.now() - this.lastTime).toFixed(2);
        console.log(`[${this.label}] ${lapLabel}: ${lapTime}ms`);
        this.lastTime = performance.now();
    }

    complete() {
        const completionTime = (performance.now() - this.startTime).toFixed(2);
        console.log(`[${this.label}] completed in ${completionTime}ms`);
    }
}
