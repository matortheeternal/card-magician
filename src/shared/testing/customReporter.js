/*
 * Adapted from the Jasmine ConsoleReporter.
 *
 * Copyright (c) 2011-2019 Pivotal Labs
 * Copyright (c) 2011-2026 The Jasmine developers
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const ansi = {
    green: '\x1B[32m',
    red: '\x1B[31m',
    yellow: '\x1B[33m',
    none: '\x1B[0m',
};

class CustomReporter {
    #print;
    #showColors;
    #alwaysListPendingSpecs;
    #listNotApplicableSpecs;
    #stackFilter;
    #failedSpecs;
    #pendingSpecs;
    #notApplicableSpecs;
    #failedSuites;
    #outputQueue;

    constructor(options) {
        if (!options?.print)
            throw new Error('CustomReporter requires a print function.');

        this.#print = options.print;
        this.#showColors = options.color ?? false;
        this.#alwaysListPendingSpecs = options.alwaysListPendingSpecs ?? true;
        this.#listNotApplicableSpecs = options.listNotApplicableSpecs ?? false;
        this.#stackFilter = options.stackFilter ?? (stack => stack);
        this.#failedSpecs = [];
        this.#pendingSpecs = [];
        this.#notApplicableSpecs = [];
        this.#failedSuites = [];
        this.#outputQueue = Promise.resolve();
    }

    jasmineStarted(options) {
        this.specCount = 0;
        this.executableSpecCount = 0;
        this.failureCount = 0;

        if (options?.order?.random) {
            this.#write(`Randomized with seed ${options.order.seed}`);
            this.#printNewline();
        }

        this.#write('Started');
        this.#printNewline();
    }

    specDone(result) {
        this.specCount++;

        switch (result.status) {
        case 'pending':
            this.#pendingSpecs.push(result);
            this.executableSpecCount++;
            this.#write(this.#colored('yellow', '*'));
            break;

        case 'notApplicable':
            this.#notApplicableSpecs.push(result);
            this.executableSpecCount++;
            break;

        case 'passed':
            this.executableSpecCount++;
            this.#write(this.#colored('green', '.'));
            break;

        case 'failed':
            this.failureCount++;
            this.#failedSpecs.push(result);
            this.executableSpecCount++;
            this.#write(this.#colored('red', 'F'));
            break;
        }
    }

    suiteDone(result) {
        if (result.failedExpectations?.length > 0) {
            this.failureCount++;
            this.#failedSuites.push(result);
        }
    }

    async jasmineDone(result) {
        if (result.failedExpectations)
            this.failureCount += result.failedExpectations.length;

        this.#printNewline();
        this.#printNewline();

        if (this.#failedSpecs.length > 0)
            this.#write('Failures:');

        for (let i = 0; i < this.#failedSpecs.length; i++)
            this.#specFailureDetails(this.#failedSpecs[i], i + 1);

        for (const failedSuite of this.#failedSuites)
            this.#suiteFailureDetails(failedSuite);

        if (result.failedExpectations?.length > 0) {
            this.#suiteFailureDetails({
                fullName: 'top suite',
                ...result,
            });
        }

        if (this.#alwaysListPendingSpecs || result.overallStatus === 'passed') {
            if (this.#pendingSpecs.length > 0)
                this.#write('Pending:');

            for (let i = 0; i < this.#pendingSpecs.length; i++)
                this.#pendingSpecDetails(this.#pendingSpecs[i], i + 1);
        }

        this.#printNotApplicableSpecs();

        if (this.specCount > 0)
            this.#printSummary();
        else
            this.#write('No specs found');

        this.#printNewline();

        const seconds = result?.totalTime / 1000 || 0;
        this.#write(`Finished in ${seconds} ${plural('second', seconds)}`);
        this.#printNewline();

        if (result?.overallStatus === 'incomplete') {
            this.#write(`Incomplete: ${result.incompleteReason}`);
            this.#printNewline();
        }

        if (result?.order?.random) {
            this.#write(`Randomized with seed ${result.order.seed}`);
            this.#printNewline();
        }

        await this.#outputQueue;
    }

    #write(text) {
        this.#outputQueue = this.#outputQueue.then(() => this.#print(text));
    }

    #printNewline() {
        this.#write('\n');
    }

    #colored(color, text) {
        if (!this.#showColors)
            return text;

        return ansi[color] + text + ansi.none;
    }

    #specFailureDetails(result, failedSpecNumber) {
        this.#printNewline();
        this.#write(`${failedSpecNumber}) ${result.fullName}`);
        this.#printFailedExpectations(result);

        if (!result.debugLogs)
            return;

        this.#printNewline();
        this.#write(indent('Debug logs:', 2));
        this.#printNewline();

        for (const entry of result.debugLogs) {
            this.#write(indent(`${entry.timestamp}ms: ${entry.message}`, 4));
            this.#printNewline();
        }
    }

    #suiteFailureDetails(result) {
        this.#printNewline();
        this.#write(`Suite error: ${result.fullName}`);
        this.#printFailedExpectations(result);
    }

    #printFailedExpectations(result) {
        for (const failedExpectation of result.failedExpectations) {
            this.#printNewline();
            this.#write(indent('Message:', 2));
            this.#printNewline();
            this.#write(
                this.#colored(
                    'red',
                    indent(failedExpectation.message, 4),
                ),
            );
            this.#printNewline();
            this.#write(indent('Stack:', 2));
            this.#printNewline();
            this.#write(
                indent(this.#stackFilter(failedExpectation.stack), 4),
            );
        }

        if (
            result.failedExpectations.length === 0
            && result.passedExpectations.length === 0
        ) {
            this.#printNewline();
            this.#write(indent('Message:', 2));
            this.#printNewline();
            this.#write(
                this.#colored(
                    'red',
                    indent('Spec has no expectations', 4),
                ),
            );
        }

        this.#printNewline();
    }

    #pendingSpecDetails(result, pendingSpecNumber) {
        this.#printNewline();
        this.#printNewline();
        this.#write(`${pendingSpecNumber}) ${result.fullName}`);
        this.#printNewline();

        const reason = result.pendingReason || 'No reason given';

        this.#write(indent(this.#colored('yellow', reason), 2));
        this.#printNewline();
    }

    #printNotApplicableSpecs() {
        if (this.#notApplicableSpecs.length === 0)
            return;

        const byReason = {};

        for (const spec of this.#notApplicableSpecs) {
            const reason = spec.notApplicableReason;

            if (!byReason[reason])
                byReason[reason] = [];

            byReason[reason].push(spec.fullName);
        }

        this.#printNewline();

        for (const [reason, specNames] of Object.entries(byReason)) {
            this.#write(
                `${specNames.length} ${plural('spec', specNames.length)}`
                + ` not applicable because: ${reason}`,
            );
            this.#printNewline();

            if (!this.#listNotApplicableSpecs)
                continue;

            for (const name of specNames) {
                this.#write(`   * ${name}`);
                this.#printNewline();
            }
        }
    }

    #printSummary() {
        this.#printNewline();

        if (this.executableSpecCount !== this.specCount) {
            this.#write(
                `Ran ${this.executableSpecCount} of ${this.specCount}`
                + plural(' spec', this.specCount),
            );
            this.#printNewline();
        }

        let summary
            = `${this.executableSpecCount} `
            + `${plural('spec', this.executableSpecCount)}, `
            + `${this.failureCount} `
            + plural('failure', this.failureCount);

        if (this.#pendingSpecs.length) {
            summary
                += `, ${this.#pendingSpecs.length} pending `
                + plural('spec', this.#pendingSpecs.length);
        }

        this.#write(summary);
    }
}

function plural(text, count) {
    return count === 1 ? text : `${text}s`;
}

function indent(text, spaces) {
    const prefix = ' '.repeat(spaces);

    return (text || '')
        .split('\n')
        .map(line => prefix + line)
        .join('\n');
}

export default CustomReporter;
